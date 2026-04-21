// VIEW CONTROLLER — connects the login form to AuthService

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginCredentials } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  credentials: LoginCredentials = { email: '', password: '' };
  showPassword = false;
  isLoading    = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading    = false;
        this.errorMessage = err.error?.message || 'Invalid credentials. Please try again.';
      },
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
