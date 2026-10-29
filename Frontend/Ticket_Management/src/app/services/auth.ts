import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoggedInUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: LoggedInUser;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  register(data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: 'user' | 'admin';
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: {
    username: string;
    password: string;
  }): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, data)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem(
            'currentUser',
            JSON.stringify(response.user)
          );
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): LoggedInUser | null {
    const user = localStorage.getItem('currentUser');

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as LoggedInUser;
    } catch {
      return null;
    }
  }

  getEmail(): string {
    return this.getCurrentUser()?.email?.toLowerCase() || '';
  }

  getRole(): string {
    return this.getCurrentUser()?.role?.toLowerCase() || 'user';
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }
}
