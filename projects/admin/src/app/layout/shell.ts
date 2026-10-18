import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BRAND } from '@shared';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="bar">
      <a class="brand" routerLink="/">{{ brand.name }} <small>Admin</small></a>
      <nav aria-label="Main">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
        @if (auth.isAdmin()) {
        <a routerLink="/products" routerLinkActive="active">Products</a>
        }
      </nav>
      <div class="who">
        <span>{{ auth.displayName() }} · {{ auth.roles().join(', ') }}</span>
        <button type="button" class="btn btn-ghost btn-small" (click)="signOut()">Sign out</button>
      </div>
    </header>
    <main class="content"><router-outlet /></main>
  `,
  styles: `
    .bar { display: flex; align-items: center; gap: 32px; padding: 14px 32px; background: #fff; border-bottom: 1px solid var(--blush); }
    .brand { font-family: var(--font-display); font-size: 1.3rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--burgundy); text-decoration: none; }
    .brand small { font-family: var(--font-body); font-size: 0.7rem; letter-spacing: 0.15em; color: var(--muted); }
    nav { display: flex; gap: 20px; flex: 1; }
    nav a { color: var(--burgundy); text-decoration: none; padding: 6px 2px; border-bottom: 2px solid transparent; }
    nav a.active { border-bottom-color: var(--burgundy); font-weight: 600; }
    .who { display: flex; align-items: center; gap: 16px; font-size: 0.9rem; color: var(--muted); }
    .content { max-width: 1200px; margin: 0 auto; padding: 32px; }
  `,
})
export class Shell {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly brand = BRAND;

  signOut(): void {
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/login'));
  }
}