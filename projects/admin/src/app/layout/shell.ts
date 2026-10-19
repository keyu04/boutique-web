import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BRAND } from '@shared';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="bar">
      <div class="bar-inner">
        <a class="brand" routerLink="/" [attr.aria-label]="brand.name + ' admin dashboard'">
          <img src="/assets/sahjish-monogram.png" alt="" />
          <span class="wordmark">{{ brand.name }}</span>
          <span class="admin-label">Admin</span>
        </a>
        <nav aria-label="Main">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
          <a routerLink="/orders" routerLinkActive="active">Orders</a>
          @if (auth.isAdmin()) {
            <a routerLink="/products" routerLinkActive="active">Products</a>
            <a routerLink="/reports" routerLinkActive="active">Reports</a>
          }
        </nav>
        <div class="who">
          <span class="avatar" aria-hidden="true">{{ auth.displayName().charAt(0) }}</span>
          <span class="identity"><strong>{{ auth.displayName() }}</strong><small>{{ auth.roles().join(', ') }}</small></span>
          <button type="button" class="sign-out" (click)="signOut()">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 4H4v12h4M11 6l4 4-4 4M6 10h9" /></svg>
            Sign out
          </button>
        </div>
      </div>
    </header>
    <main class="content"><router-outlet /></main>
  `,
  styles: `
    :host { display: block; min-height: 100vh; }
    .bar { background: #fffdfa; border-bottom: 1px solid #eadfd5; }
    .bar-inner { display: flex; min-height: 66px; max-width: 1200px; align-items: stretch; gap: 34px; margin: 0 auto; padding: 0 30px; }
    .brand { display: inline-flex; flex: 0 0 auto; align-items: center; gap: 9px; color: var(--burgundy); text-decoration: none; }
    .brand img { width: 40px; height: 40px; object-fit: contain; }
    .wordmark { font-family: var(--font-display); font-size: 1.15rem; letter-spacing: 0.2em; text-transform: uppercase; }
    .admin-label { margin-left: 2px; padding: 4px 0 4px 12px; border-left: 1px solid #eadfd5; color: var(--muted); font-size: 0.66rem; letter-spacing: 0.07em; text-transform: uppercase; }
    nav { display: flex; flex: 1; align-items: stretch; gap: 26px; }
    nav a { display: inline-flex; align-items: center; border-bottom: 2px solid transparent; color: #776a68; font-size: 0.9rem; text-decoration: none; }
    nav a.active { border-bottom-color: var(--burgundy); color: var(--burgundy); font-weight: 700; }
    .who { display: flex; align-items: center; gap: 8px; color: #3c3032; }
    .avatar { display: grid; width: 30px; height: 30px; place-items: center; border-radius: 50%; background: #f0e3e2; color: var(--burgundy); font-size: 0.8rem; font-weight: 600; }
    .identity { display: flex; flex-direction: column; gap: 1px; font-size: 0.78rem; line-height: 1.2; }
    .identity strong { font-weight: 500; }
    .identity small { color: var(--muted); font-size: 0.68rem; }
    .sign-out { display: inline-flex; height: 34px; align-items: center; gap: 7px; margin-left: 8px; padding: 0 12px; border: 1px solid #eadfd5; border-radius: 4px; background: transparent; color: var(--burgundy); font: inherit; font-size: 0.8rem; cursor: pointer; white-space: nowrap; }
    .sign-out:hover { background: #f8f0e9; }
    .sign-out svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.5; }
    .content { max-width: 1200px; margin: 0 auto; padding: 34px 30px 56px; }
    a:focus-visible, button:focus-visible { outline: 2px solid #9b5369; outline-offset: 3px; }
    @media (max-width: 760px) {
      .bar-inner { flex-wrap: wrap; gap: 0 18px; padding: 0 18px; }
      .brand { min-height: 56px; }
      nav { order: 3; flex-basis: 100%; gap: 20px; overflow-x: auto; }
      nav a { min-height: 40px; white-space: nowrap; }
      .who { margin-left: auto; }
      .content { padding: 28px 22px 44px; }
    }
    @media (max-width: 480px) {
      .bar-inner { column-gap: 10px; padding-inline: 12px; }
      .brand { gap: 6px; }
      .brand img { width: 34px; height: 34px; }
      .wordmark { font-size: 0.93rem; letter-spacing: 0.13em; }
      .admin-label { padding-left: 7px; font-size: 0.56rem; }
      .identity { display: none; }
      .content { padding: 24px 16px 40px; }
    }
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