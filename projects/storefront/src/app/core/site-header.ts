import { Component, inject } from '@angular/core';
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
      <a class="bag-link" routerLink="/bag" [attr.aria-label]="'Bag, ' + bag.count() + (bag.count() === 1 ? ' item' : ' items')">
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <path d="M7 13h22l2 19H5l2-19Z" />
          <path d="M13 13V9a5 5 0 0 1 10 0v4" />
        </svg>
        <span class="count">{{ bag.count() }}</span>
      </a>
    </header>
  `,
  styles: `
    :host { display: block; border-bottom: 1px solid var(--blush, #ecd5d3); }
    .topbar { width: calc(100% - 48px); max-width: 1200px; margin: 0 auto; padding: 28px 0;
      display: flex; align-items: center; justify-content: space-between; }
    .brand-lockup { display: inline-flex; align-items: center; gap: 14px; color: var(--burgundy, #5c1a2e);
      text-decoration: none; }
    .brand-mark { display: block; width: 52px; height: 52px; object-fit: contain; }
    .wordmark { font-family: var(--font-display, 'Bodoni Moda', serif); font-size: 1.6rem;
      letter-spacing: 0.35em; text-transform: uppercase; text-decoration: none;
      color: var(--burgundy, #5c1a2e); }
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
    @media (max-width: 600px) {
      .topbar { width: calc(100% - 36px); padding: 14px 0; }
      .brand-mark { width: 44px; height: 44px; }
      .wordmark { display: none; }
    }
  `,
})
export class SiteHeader {
  readonly brand = BRAND;
  readonly bag = inject(BagService);
}