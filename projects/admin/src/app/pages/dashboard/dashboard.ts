import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { API_BASE_URL } from '@shared';
import { AuthService } from '../../core/auth.service';

interface Me { id: string; email: string; roles: string[]; }

@Component({
  selector: 'app-dashboard',
  template: `
    <h1>Welcome, {{ auth.displayName() }}</h1>
    @if (me(); as m) {
      <p>Signed in as <strong>{{ m.email }}</strong> ({{ m.roles.join(', ') }}).</p>
    }
    <p class="muted">Products, orders and reports are coming next.</p>
  `,
  styles: `
    h1 { font-family: var(--font-display); font-weight: 500; font-size: 2.2rem; margin: 0 0 16px; }
    .muted { color: var(--muted); }
  `,
})
export class DashboardPage {
  readonly auth = inject(AuthService);
  readonly me = toSignal(
    inject(HttpClient).get<Me>(`${inject(API_BASE_URL)}/auth/me`),
    { initialValue: null },
  );
}