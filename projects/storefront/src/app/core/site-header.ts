import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BRAND } from '@shared';
import { BagService } from './bag.service';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink],
  template: `
    <header class="topbar">
      <a class="wordmark" routerLink="/">{{ brand.name }}</a>
      <a class="bag-link" routerLink="/bag" [attr.aria-label]="'Bag, ' + bag.count() + ' items'">
        Bag ({{ bag.count() }})
      </a>
    </header>
  `,
  styles: `
    :host { display: block; border-bottom: 1px solid var(--blush, #ecd5d3); }
    .topbar { width: calc(100% - 48px); max-width: 1200px; margin: 0 auto; padding: 28px 0;
      display: flex; align-items: center; justify-content: space-between; }
    .wordmark { font-family: var(--font-display, 'Bodoni Moda', serif); font-size: 1.6rem;
      letter-spacing: 0.35em; text-transform: uppercase; text-decoration: none;
      color: var(--burgundy, #5c1a2e); }
    .bag-link { font-size: 0.95rem; text-decoration: none; color: var(--burgundy, #5c1a2e); }
    .bag-link:hover { text-decoration: underline; }
  `,
})
export class SiteHeader {
  readonly brand = BRAND;
  readonly bag = inject(BagService);
}