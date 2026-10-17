import { Component } from '@angular/core';
import { BRAND } from '@shared';

@Component({
  selector: 'app-site-footer',
  template: `
    <footer class="footer">
      <div class="footer-inner">
        <span class="footer-mark">{{ brand.name }}</span>
        <span>© 2026 {{ brand.name }} Fashion. All rights reserved.</span>
      </div>
    </footer>
  `,
  styles: `
    :host { display: block; }
    .footer { background: var(--burgundy); color: var(--cream); padding: 40px 24px; }
    .footer-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .footer-mark { font-family: var(--font-display); letter-spacing: 0.28em; text-transform: uppercase; }
  `,
})
export class SiteFooter {
  readonly brand = BRAND;
}
