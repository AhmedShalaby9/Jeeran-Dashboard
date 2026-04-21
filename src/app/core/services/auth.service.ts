// SERVICE (Controller) — handles all auth-related logic
// No logic yet — will be wired to the API later

import { Injectable } from '@angular/core';
import { LoginCredentials } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  login(credentials: LoginCredentials): void {
    // TODO: call POST /api/auth/login
    console.log('Login called with:', credentials);
  }

  logout(): void {
    // TODO: clear token and redirect
    console.log('Logout called');
  }

  isLoggedIn(): boolean {
    // TODO: check token from localStorage
    return false;
  }
}
