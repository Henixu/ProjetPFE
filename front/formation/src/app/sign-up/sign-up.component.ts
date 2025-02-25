import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { NgToastService } from 'ng-angular-popup';
import { AnimationEvent, trigger, state, style, transition, animate } from '@angular/animations';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sign-up',
  standalone: false,
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
  animations: [
    trigger('fadeAnimation', [
      state('in', style({ opacity: 1 })),
      state('out', style({ opacity: 0 })),
      transition('in => out', animate('500ms ease-out'))
    ])
  ]
})
export class SignUpComponent {
  signupForm: FormGroup;
  errorMessage: string = '';
  animationState: 'in' | 'out' = 'in';

  constructor(private fb: FormBuilder, private authService: AuthService, private toast: NgToastService, private router: Router) {
    this.signupForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email, this.emailDomainValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_repeat: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }
  emailDomainValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    if (email && !email.endsWith('@soprahr.com')) {
      return { invalidDomain: true };
    }
    return null;
  }
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const password_repeat = form.get('password_repeat')?.value;
    return password === password_repeat ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.toast.warning('Please check your inputs.', 'Warning', 3000);
      return;
    }

    const { first_name, last_name, email, password } = this.signupForm.value;
    
    this.authService.signup(first_name, last_name, email, password).subscribe({
      next: (response) => {
        console.log('Signup successful', response);
        this.toast.success('Signup successful. Welcome!', 'Success', 3000);
        this.signupForm.reset();
        this.animationState = 'out';
        
        // Redirect to login page with animation
        document.body.classList.add('animate__animated', 'animate__fadeOut');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000); // 1 second delay for animation

      },
      error: (err) => {
        console.error('Signup error', err);
        this.errorMessage = "Signup failed. Try again.";
        this.toast.danger(err.error.error, 'Error', 3000);
        
      }
    });
  }
  onAnimationDone(event: AnimationEvent) {
    if (event.toState === 'out') {
      this.router.navigate(['/login']);
    }
  }
}
