// VIEW CONTROLLER — connects the login view to the AuthService

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    this.authService.login(this.credentials);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
