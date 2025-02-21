import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forget-password',
  standalone: false,
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponent {
  forgetPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.forgetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  
    // Log value changes
    this.forgetPasswordForm.get('email')?.valueChanges.subscribe(value => {
      console.log('Email changed:', value);
    });
  }
  
  onSubmit(): void {
    if (this.forgetPasswordForm.valid) {
      const { email } = this.forgetPasswordForm.value;
      console.log('Email submitted:', email); // Now this logs the value entered by the user.
      
      this.authService.sendResetPasswordEmail(email).subscribe({
        next: (response) => {
          console.log('Success:', response);
          // Optionally show a success message to the user
        },
        error: (error) => {
          console.error('Error:', error);
          // Show an error message to the user
        }
      });
    }
  }
  
}