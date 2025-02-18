import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { MsalService } from '@azure/msal-angular';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please enter valid credentials.';
      return;
    }

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        // Handle login success (e.g., store token, redirect)
      },
      error: (err) => {
        this.errorMessage = 'Invalid email or password.';
        console.error('Login error', err);
      }
    });
  }

  microsoftLogin(): void {
    // Redirect to your Django endpoint for Microsoft login
    window.location.href = 'http://127.0.0.1:8000/microsoft-login';
  }
}
