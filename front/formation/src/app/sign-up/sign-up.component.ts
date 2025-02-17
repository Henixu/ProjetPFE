import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-sign-up',
  standalone: false,
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  signupForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.signupForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_repeat: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const password_repeat = form.get('password_repeat')?.value;
    return password === password_repeat ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.errorMessage = "Please check your inputs.";
      return;
    }

    const { first_name, last_name, email, password } = this.signupForm.value;
    
    this.authService.signup(first_name, last_name, email, password).subscribe({
      next: (response) => {
        console.log('Signup successful', response);
      },
      error: (err) => {
        console.error('Signup error', err);
        this.errorMessage = "Signup failed. Try again.";
      }
    });
  }
}
