import { Component, DestroyRef, ElementRef, HostListener, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BRAND } from '@shared';
import { BagService } from './bag.service';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink],
  template: `
    <header class="topbar">
      <a class="brand-lockup" routerLink="/" [attr.aria-label]="brand.name">
        <img class="brand-mark" src="/assets/sahjish-monogram.png" alt="" />
        <span class="wordmark">{{ brand.name }}</span>
      </a>
      <nav class="header-actions" aria-label="Order links">
        @if (trackingPage) {
          <a class="continue-link" routerLink="/">Continue shopping
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13M10 4l6 6-6 6" /></svg>
          </a>
        } @else {
          <a class="track-link" routerLink="/track" aria-label="Track your order" title="Track your order">
            <svg viewBox="0 0 40 40" aria-hidden="true">
              <path d="M4 10 20 2l16 8-16 8L4 10Z" />
              <path d="M4 10v19l16 8 7-3.5M20 18v19M36 10v10" />
              <path d="m12 6 16 8M12 6v8" />
              <path d="M31 19c-4.4 0-8 3.6-8 8 0 5.2 8 12 8 12s8-6.8 8-12c0-4.4-3.6-8-8-8Z" />
              <circle cx="31" cy="27" r="2.5" />
            </svg>
          </a>
        }
        <a class="bag-link" routerLink="/bag" [attr.aria-label]="'Bag, ' + bag.count() + (bag.count() === 1 ? ' item' : ' items')">
          <svg viewBox="0 0 36 36" aria-hidden="true">
            <path d="M7 13h22l2 19H5l2-19Z" />
            <path d="M13 13V9a5 5 0 0 1 10 0v4" />
          </svg>
          <span class="count">{{ bag.count() }}</span>
        </a>
      </nav>
    </header>
  `,
  styles: `
    :host { position: sticky; top: 0; z-index: 100; display: block; border-bottom: 1px solid var(--blush, #ecd5d3);
      background: var(--cream, #f8f1e3); transition: transform 240ms ease; }
    :host(.hidden) { transform: translateY(-100%); }
    .topbar { width: calc(100% - 48px); max-width: 1200px; margin: 0 auto; padding: 28px 0;
      display: flex; align-items: center; justify-content: space-between; }
    .brand-lockup { display: inline-flex; align-items: center; gap: 14px; color: var(--burgundy, #5c1a2e);
      text-decoration: none; }
    .brand-mark { display: block; width: 52px; height: 52px; object-fit: contain; }
    .wordmark { font-family: var(--font-display, 'Bodoni Moda', serif); font-size: 1.6rem;
      letter-spacing: 0.35em; text-transform: uppercase; text-decoration: none;
      color: var(--burgundy, #5c1a2e); }
    .header-actions { display: flex; align-items: center; gap: 16px; }
    .continue-link { display: inline-flex; align-items: center; gap: 8px; color: var(--burgundy, #5c1a2e);
      font-size: 0.9rem; text-decoration: none; white-space: nowrap; }
    .continue-link svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.5;
      stroke-linecap: round; stroke-linejoin: round; }
    .continue-link:hover { text-decoration: underline; text-underline-offset: 4px; }
    .continue-link:focus-visible { outline: 2px solid var(--burgundy, #5c1a2e); outline-offset: 4px; }
    .track-link { display: inline-flex; width: 36px; height: 36px; align-items: center;
      justify-content: center; color: var(--burgundy, #5c1a2e); text-decoration: none; }
    .track-link svg { width: 26px; height: 26px; fill: none; stroke: currentColor; stroke-width: 2.3;
      stroke-linecap: round; stroke-linejoin: round; }
    .track-link:hover svg { transform: translateY(-1px); }
    .track-link svg { transition: transform 150ms ease; }
    .track-link:focus-visible { outline: 2px solid var(--burgundy, #5c1a2e); outline-offset: 4px; }
    .bag-link { position: relative; display: inline-flex; width: 36px; height: 36px; align-items: center;
      justify-content: center; color: var(--burgundy, #5c1a2e); text-decoration: none; }
    .bag-link svg { width: 26px; height: 26px; fill: none; stroke: currentColor; stroke-width: 2;
      stroke-linecap: round; stroke-linejoin: round; }
    .count { position: absolute; top: -2px; right: -5px; display: grid; min-width: 17px; height: 17px;
      place-items: center; padding: 0 4px; border-radius: 999px; background: var(--burgundy, #5c1a2e);
      color: var(--cream, #f8f1e3); font: 500 0.65rem/1 var(--font-body, system-ui, sans-serif); }
    .bag-link:hover svg { transform: translateY(-1px); }
    .bag-link svg { transition: transform 150ms ease; }
    .bag-link:focus-visible { outline: 2px solid var(--burgundy, #5c1a2e); outline-offset: 4px; }
    @media (prefers-reduced-motion: reduce) {
      :host { transition: none; }
    }
    @media (max-width: 600px) {
      .topbar { width: calc(100% - 36px); padding: 14px 0; }
      .brand-mark { width: 44px; height: 44px; }
      .wordmark { display: none; }
    }
  `,
})
export class SiteHeader {
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  private readonly idleDelay = 3500;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  @Input() trackingPage = false;
  readonly brand = BRAND;
  readonly bag = inject(BagService);

  constructor() {
    this.destroyRef.onDestroy(() => this.clearIdleTimer());
  }

  @HostListener('window:scroll')
  @HostListener('window:pointermove')
  @HostListener('window:touchstart')
  @HostListener('window:keydown')
  showWhileActive(): void {
    this.classListHidden(false);
    this.clearIdleTimer();

    if (window.scrollY > 80) {
      this.idleTimer = setTimeout(() => {
        this.idleTimer = null;
        if (window.scrollY > 80) this.classListHidden(true);
      }, this.idleDelay);
    }
  }

  private classListHidden(hidden: boolean): void {
    if (this.host.classList.contains('hidden') === hidden) return;
    this.host.classList.toggle('hidden', hidden);
    window.dispatchEvent(new Event('site-header-visibility-change'));
  }

  private clearIdleTimer(): void {
    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }
}