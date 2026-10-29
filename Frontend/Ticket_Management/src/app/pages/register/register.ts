
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  role: 'user' | 'admin' = 'user';

  isLoading: boolean = false;

  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  onRegister(): void {
    if (
      !this.username.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.confirmPassword
    ) {
      alert('Please fill in all fields.');
      return;
    }

    if (this.username.trim().length < 3) {
      alert('Username must contain at least 3 characters.');
      return;
    }

    if (this.password.length < 8) {
      alert('Password must contain at least 8 characters.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    this.isLoading = true;

    this.auth.register({
      username: this.username.trim(),
      email: this.email.trim(),
      password: this.password,
      confirmPassword: this.confirmPassword,
      role: this.role,
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        alert(response.message || 'Registration successful!');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading = false;

        alert(
          error.error?.message ||
          'Registration failed. Please check your backend.'
        );

        console.error('Registration error:', error);
      }
    });
  }
}
