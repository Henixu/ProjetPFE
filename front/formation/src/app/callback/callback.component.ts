import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-callback',
  standalone: false,
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.css'
})
export class CallbackComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      console.log('Token from URL:', token);
      if (token) {
        // Save the token (for example, in localStorage)
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token); // Store token safely
        } else {
          console.warn('localStorage is not available in this environment');
        }
        // Redirect to a protected route or home
        this.router.navigate(['/home']);
      } else {
        console.error('No token found in URL');
      }
    });
  }
}
