import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { API_BASE_URL } from '@shared';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService, isAuthRejection } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const apiBase = inject(API_BASE_URL);

  const isApi = req.url.startsWith(apiBase);
  const isPublic = req.url === `${apiBase}/auth/login` || req.url === `${apiBase}/auth/refresh`;
  if (!isApi || isPublic) return next(req);

  const withToken = (r: HttpRequest<unknown>, token: string | null) =>
    token ? r.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : r;

  return next(withToken(req, auth.accessToken())).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) return throwError(() => error);

      // Token expired: refresh once, then retry the original request with the new token.
      return auth.refresh().pipe(
        catchError(refreshError => {
          if (isAuthRejection(refreshError)) {
            auth.clear();
            router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
          }
          // Network trouble: stay signed in, just fail this one request.
          return throwError(() => error);
        }),
        switchMap(session => next(withToken(req, session.accessToken))),
      );
    }),
  );
};
