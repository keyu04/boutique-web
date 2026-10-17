import { HttpErrorResponse } from '@angular/common/http';

export function apiMessage(
  e: HttpErrorResponse,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (e.status === 0) return 'Cannot reach the server. Check your connection and try again.';
  const body = e.error;
  if (body && typeof body === 'object') {
    if (typeof body.error === 'string') return body.error;
    if (body.errors && typeof body.errors === 'object') {
      const first = Object.values(body.errors).flat()[0];
      if (typeof first === 'string') return first;
    }
    if (typeof body.detail === 'string') return body.detail;
    if (typeof body.title === 'string') return body.title;
  }
  return fallback;
}