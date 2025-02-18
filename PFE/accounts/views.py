from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.utils import timezone
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.models import Token
import json
from .models import History
from .utils import get_client_ip

@csrf_exempt
def register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            first_name = data.get('first_name')
            last_name = data.get('last_name')
            email = data.get('email')
            password = data.get('password')
            username = email  # Use email as username
            

            if not all([first_name, last_name, email, password]):
                return JsonResponse({'error': 'All fields are required.'}, status=400)

            if User.objects.filter(email=email).exists():
                return JsonResponse({'error': 'Email already registered.'}, status=400)

            user = User.objects.create_user(
                username=username, email=email, password=password,
                first_name=first_name, last_name=last_name
            )

            # Create a token for the user
            token, created = Token.objects.get_or_create(user=user)

            return JsonResponse({'message': 'User registered successfully.', 'token': token.key}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)

@csrf_exempt
def user_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            if not all([email, password]):
                return JsonResponse({'error': 'Email and password are required.'}, status=400)

            ip_address = get_client_ip(request)

            # Check if IP is banned
            history, created = History.objects.get_or_create(ip_address=ip_address)
            if history.is_banned and (timezone.now() - history.timestamp).total_seconds() < 180:
                return JsonResponse({'error': 'Too many failed attempts. Your IP is banned for 3 minutes.'}, status=403)

            user = authenticate(request, username=email, password=password)
            if user is not None:
                history.attempt_count = 0
                history.is_banned = False
                history.save()

                login(request, user)

                # Generate or retrieve token
                token, created = Token.objects.get_or_create(user=user)

                return JsonResponse({'message': 'Login successful.', 'token': token.key}, status=200)
            else:
                history.attempt_count += 1

                if history.attempt_count >= 3:
                    history.is_banned = True
                    history.timestamp = timezone.now()
                    history.save()
                    return JsonResponse({'error': 'Too many failed attempts. Your IP is banned for 3 minutes.'}, status=403)

                history.save()
                return JsonResponse({'error': 'Incorrect password. Please try again.'}, status=401)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)

@csrf_exempt
def user_logout(request):
    if request.method == 'POST':
        try:
            token = request.headers.get('Authorization')
            if not token:
                return JsonResponse({'error': 'Token required for logout.'}, status=400)

            token_key = token.split(' ')[1]  # Extract token from "Token <token_key>"

            try:
                token = Token.objects.get(key=token_key)
                token.delete()  # Delete token to log out the user
                logout(request)
                return JsonResponse({'message': 'Logout successful.'}, status=200)
            except Token.DoesNotExist:
                return JsonResponse({'error': 'Invalid token.'}, status=401)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)



import msal
from django.conf import settings
from django.http import HttpResponseRedirect

def microsoft_login(request):
    authority = f"https://login.microsoftonline.com/{settings.MS_TENANT}"
    client = msal.ConfidentialClientApplication(
        settings.MS_CLIENT_ID,
        authority=authority,
        client_credential=settings.MS_CLIENT_SECRET
    )
    auth_url = client.get_authorization_request_url(
        settings.MS_SCOPES,
        redirect_uri=settings.MS_REDIRECT_URI,
        state="optional-csrf-token-or-random-string"  # you may include state for security
    )
    
    return HttpResponseRedirect(auth_url)


# views_microsoft.py (continued)
import json
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token  # assuming you're using DRF TokenAuth
import msal

User = get_user_model()

def microsoft_callback(request):
    code = request.GET.get('code', None)
    if not code:
        return HttpResponse("No code provided", status=400)
    
    authority = f"https://login.microsoftonline.com/{settings.MS_TENANT}"
    client = msal.ConfidentialClientApplication(
        settings.MS_CLIENT_ID,
        authority=authority,
        client_credential=settings.MS_CLIENT_SECRET
    )
    
    result = client.acquire_token_by_authorization_code(
        code,
        scopes=settings.MS_SCOPES,
        redirect_uri=settings.MS_REDIRECT_URI
    )
    print(result)
    if "id_token_claims" not in result:
        return HttpResponse("Authentication failed", status=400)
    
    id_claims = result["id_token_claims"]
    email = id_claims.get("preferred_username")  # usually the email is here
    first_name = id_claims.get("given_name", "")
    last_name = id_claims.get("family_name", "")
    
    # Verify the email domain
    if not email or not email.endswith("@soprahr.com"):
        return HttpResponse("Unauthorized email domain", status=403)
    
    # Create or get the user
    user, created = User.objects.get_or_create(email=email, defaults={
        "username": email,
        "first_name": first_name,
        "last_name": last_name,
    })
    
    # Optionally, update user details if needed
    if not created:
        user.first_name = first_name
        user.last_name = last_name
        user.save()
    
    # Generate or retrieve a token (like in your other views)
    token, _ = Token.objects.get_or_create(user=user)
    
    # Redirect back to your Angular app.
    # For example, append the token as a query parameter (ensure HTTPS and consider security implications)
    angular_app_url = "http://localhost:4200/callback"
    redirect_url = f"{angular_app_url}?token={token.key}"
    return HttpResponseRedirect(redirect_url)
