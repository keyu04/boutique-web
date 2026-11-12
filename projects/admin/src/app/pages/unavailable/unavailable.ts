import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-unavailable',
  template: `
    <main class="box" role="alert">
      <h1>We can’t reach the server</h1>
      <p>You’re still signed in. Check that the API is running, then try again.</p>
      <button type="button" class="retry" [disabled]="retrying()" (click)="retry()">
        {{ retrying() ? 'Trying…' : 'Try again' }}
      </button>
    </main>
  `,
  styles: `
    .box { max-width: 420px; margin: 18vh auto; padding: 0 20px; text-align: center; }
    h1 { margin: 0 0 10px; color: var(--burgundy); font-family: var(--font-display); font-weight: 500; }
    p { margin: 0 0 22px; color: #766965; }
    .retry { min-height: 40px; padding: 0 22px; border: 1px solid var(--burgundy); border-radius: 6px;
             background: var(--burgundy); color: #fff; font: inherit; font-weight: 600; cursor: pointer; }
    .retry:disabled { opacity: 0.6; cursor: wait; }
  `,
})
export class UnavailablePage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly retrying = signal(false);

  retry(): void {
    this.retrying.set(true);
    void this.auth.restore().then(() => {
      this.retrying.set(false);
      const wanted = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
      const returnUrl = wanted.startsWith('/') && !wanted.startsWith('//') ? wanted : '/';
      if (this.auth.isAuthenticated()) void this.router.navigateByUrl(returnUrl);
      else if (!this.auth.unreachable()) void this.router.navigate(['/login'], { queryParams: { returnUrl } });
    });
  }
}
