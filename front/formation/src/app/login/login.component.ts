import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { MsalService } from '@azure/msal-angular';
import { HttpClient } from '@angular/common/http';
import { NgToastService, ToasterPosition, ToastType } from 'ng-angular-popup';
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
    private toast: NgToastService,
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
      this.toast.warning('Please enter valid credentials.', 'Warning', 3000);
      return;
    }

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.toast.success('Login successful welcome', 'Success', 3000);

        
      },
      error: (err) => {
        this.errorMessage = 'Invalid email or password.';
        
        this.toast.danger(err.error.error, 'Error', 3000);
      }
    });
  }

  microsoftLogin(): void {
    // Redirect to your Django endpoint for Microsoft login
    window.location.href = 'http://127.0.0.1:8000/microsoft-login';
    this.toast.success('Login successful welcome', 'Success', 3000);
  }
}
