// INTERCEPTOR — tells the backend this client speaks the "compound" dialect
// (see Jeeran-Backend/middleware/apiVersion.js). Without the header the API answers in the legacy
// "project" names that older clients expect.

import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiVersionInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) return next(req);
  return next(req.clone({ setHeaders: { 'X-Api-Version': '2' } }));
};
