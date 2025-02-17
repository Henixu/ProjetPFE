import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000'; // Update this with your Django backend URL

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  signup(first_name: string, last_name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { first_name, last_name, email, password });
  }
}
