
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  username: string = '';
  password: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  onLogin(): void {

    if (!this.username.trim() || !this.password) {
      alert('Please enter username/email and password.');
      return;
    }

    this.isLoading = true;

    this.auth.login({
      username: this.username.trim(),
      password: this.password
    }).subscribe({
      next: (response) => {
        this.isLoading = false;

        console.log('Login response:', response);

        // Store the token if your backend returns one.
        if (response.token) {
          localStorage.setItem('token', response.token);
        }

        alert(response.message || 'Login successful!');

        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;

        console.error('Login error:', error);
        console.error('Backend response:', error.error);

        alert(
          error.error?.message ||
          `Login failed. HTTP status: ${error.status}`
        );
      }
    });
  }
}
