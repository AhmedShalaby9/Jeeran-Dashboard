// INTERCEPTOR — catches 401 responses globally and logs the user out

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginRequest = req.url.includes('/auth/admin/login');
      if (error.status === 401 && !isLoginRequest) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
