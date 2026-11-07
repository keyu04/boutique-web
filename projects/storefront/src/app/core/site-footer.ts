import { Component } from '@angular/core';
import { BRAND } from '@shared';

@Component({
  selector: 'app-site-footer',
  template: `
    <footer class="footer">
      <!-- <section class="newsletter" aria-labelledby="newsletter-title">
        <div class="newsletter-inner">
          <div class="newsletter-copy">
            <p class="eyebrow">The {{ brand.name }} letter</p>
            <h2 id="newsletter-title">A little {{ brand.name }},<br />in your inbox.</h2>
            <p>New arrivals, styling ideas, and exclusive offers.<br class="desktop-break" /> Be the first to know.</p>
          </div>
          <div class="newsletter-form" aria-label="Email updates">
            <p class="email-title">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m4 7 8 6 8-6" /></svg>
              Email updates
            </p>
            <div class="subscribe-row">
              <label class="email-field">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m4 7 8 6 8-6" /></svg>
                <span class="sr">Your email address</span>
                <input type="email" placeholder="Your email address" disabled />
              </label>
              <button type="button" class="subscribe" disabled>
                Subscribe
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13M10 4l6 6-6 6" /></svg>
              </button>
            </div>
            <p class="subscribe-note">Email updates are coming soon. <a href="#" (click)="keepPlaceholder($event)">Privacy Policy</a>.</p>
          </div>
        </div>
        <svg class="newsletter-leaves" viewBox="0 0 180 110" aria-hidden="true">
          <path d="M175 4C132 28 106 54 74 105M151 17c-19-2-29-8-37-15 17-5 32 0 37 15ZM128 32c-22-4-31-12-37-23 21-4 35 5 37 23ZM108 49c-23-1-35-7-44-17 20-8 37 0 44 17ZM91 68c-20-2-33-8-41-17 19-8 34 1 41 17ZM136 27c2-20 11-31 22-38 4 20-5 34-22 38ZM117 46c1-21 8-34 18-42 7 20-1 35-18 42ZM98 66c2-21 9-33 20-41 5 20-3 35-20 41Z" />
        </svg>
      </section> -->

      <div class="footer-main">
        <svg class="footer-leaves" viewBox="0 0 160 210" aria-hidden="true">
          <path d="M82 205c4-56 14-99 61-157M105 126c-26 0-42-9-53-24 25-8 45 1 53 24ZM116 99c-20-13-29-28-30-45 24 5 35 23 30 45ZM130 72c-12-18-14-35-8-51 19 14 22 33 8 51ZM90 156c-25-3-40-14-49-31 26-4 44 8 49 31ZM145 49c4-23 14-37 30-45 3 25-10 42-30 45ZM74 183c-23-2-39-10-51-25 23-8 43 1 51 25Z" />
        </svg>
        <div class="footer-inner">
          <div class="brand-column">
            <a class="footer-brand" href="/" [attr.aria-label]="brand.name + ' home'">{{ brand.name }}</a>
            <h2>An expression of you.</h2>
            <p>Everyday moments, special occasions,<br />find something that feels like you.</p>
            <h3 class="social-heading">Follow our world</h3>
            <div class="social-links" aria-label="Social media">
              <a href="#" aria-label="Instagram (coming soon)" title="Coming soon" (click)="keepPlaceholder($event)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></svg>
              </a>
              <a href="#" aria-label="Facebook (coming soon)" title="Coming soon" (click)="keepPlaceholder($event)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h1.7V1.4C17 1.2 15.8 1 14.5 1 11 1 9 3.1 9 6.8V9H6v4h3v8h5Z" /></svg>
              </a>
              <a href="#" aria-label="WhatsApp (coming soon)" title="Coming soon" (click)="keepPlaceholder($event)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6Z" /><path d="M9 8.5c.5 2 2 3.5 4.5 4.5l1-1 2 1c-.2 1.4-1.3 2-2.6 1.8-3.5-.6-6.2-3.3-6.8-6.8C7 6.7 7.6 5.6 9 5.4l1 2-1 1.1Z" /></svg>
              </a>
            </div>
          </div>

          <nav class="footer-links" aria-label="Footer navigation">
            <div class="link-column">
              <h2>Discover</h2>
              <a href="/#collection">Shop All</a>
              <a href="/#collection">Dresses</a>
              <a href="/#collection">Kurta Sets</a>
              <a href="/#collection">Kurtis</a>
              <a href="/#collection">Co-ords</a>
              <a href="/#collection">Sarees</a>
            </div>
            <div class="link-column">
              <h2>Customer Care</h2>
              <a href="/track">Track Your Order</a>
              <a href="#" (click)="keepPlaceholder($event)">Shipping &amp; Delivery</a>
              <a href="#" (click)="keepPlaceholder($event)">Returns &amp; Exchanges</a>
              <a href="#" (click)="keepPlaceholder($event)">Size Guide</a>
              <a href="#" (click)="keepPlaceholder($event)">Contact Us</a>
            </div>
            <div class="link-column">
              <h2>{{ brand.name }}</h2>
              <a href="#" (click)="keepPlaceholder($event)">Our Story</a>
              <a href="#" (click)="keepPlaceholder($event)">My Account</a>
              <a href="#" (click)="keepPlaceholder($event)">My Wishlist</a>
            </div>
          </nav>
        </div>

        <div class="footer-bottom">
          <span class="copyright">© 2026 {{ brand.name }} Fashion. All rights reserved.</span>
          <div class="legal-links">
            <a href="#" (click)="keepPlaceholder($event)">
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 2h8l4 4v12H4V2Z" /><path d="M12 2v5h5m-10 3h6m-6 3h6m-6 3h4" /><circle cx="15" cy="15" r="3" /></svg>
              Privacy Policy
            </a>
            <a href="#" (click)="keepPlaceholder($event)">
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2 17 5v5c0 4-2.8 6.5-7 8-4.2-1.5-7-4-7-8V5l7-3Z" /><path d="m7 10 2 2 4-4" /></svg>
              Terms of Service
            </a>
          </div>
          <a class="back-to-top" href="#" (click)="scrollToTop($event)">
            Back to Top
            <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  `,
  styles: `
    :host { display: block; }
    .footer { color: var(--cream); }
    .newsletter { position: relative; overflow: hidden; padding: 42px 24px 38px; background: #fff8f1; color: var(--burgundy); }
    .newsletter-inner { position: relative; z-index: 1; display: grid; max-width: 1200px; grid-template-columns: 0.85fr 1.15fr; align-items: center; gap: 64px; margin: 0 auto; }
    .newsletter .eyebrow { margin: 0 0 12px; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
    .newsletter h2 { margin: 0; font-family: var(--font-display); font-size: clamp(2rem, 3.2vw, 3.2rem); font-weight: 500; line-height: 1.08; }
    .newsletter-copy > p:last-child { margin: 14px 0 0; color: var(--muted); font-size: 1rem; line-height: 1.5; }
    .email-title { display: flex; align-items: center; gap: 10px; margin: 0 0 16px; font-family: var(--font-display); font-size: 1.25rem; font-style: italic; }
    .email-title svg, .email-field svg { width: 22px; height: 22px; flex: 0 0 auto; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
    .subscribe-row { display: flex; gap: 16px; }
    .email-field { display: flex; min-width: 0; min-height: 56px; flex: 1; align-items: center; gap: 12px; padding: 0 20px; border: 1px solid var(--blush); border-radius: 18px; color: var(--burgundy); }
    .email-field input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--burgundy); font: inherit; }
    .email-field input::placeholder { color: var(--muted); opacity: 1; }
    .subscribe { display: inline-flex; min-width: 170px; min-height: 56px; align-items: center; justify-content: center; gap: 12px; padding: 0 24px; border: 0; border-radius: 18px; background: var(--burgundy); color: var(--cream); font: inherit; font-family: var(--font-display); font-size: 1.15rem; font-weight: 600; }
    .subscribe svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
    .subscribe:disabled, .email-field input:disabled { cursor: not-allowed; }
    .subscribe-note { margin: 10px 0 0 16px; color: var(--muted); font-size: 0.84rem; }
    a { color: inherit; }
    .subscribe-note a { text-underline-offset: 3px; }
    .newsletter-leaves { position: absolute; top: -40px; right: 12px; width: 150px; color: #e7a996; fill: rgb(231 169 150 / 24%); stroke: currentColor; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
    .footer-main { position: relative; overflow: hidden; padding: 42px 24px 26px; background: radial-gradient(ellipse at 38% 100%, #711a39 0, transparent 48%), var(--burgundy); }
    .footer-main::before { position: absolute; top: -20px; right: -2%; left: -2%; height: 40px; border-radius: 50% 50% 0 0 / 100% 100% 0 0; background: #fff8f1; content: ''; }
    .footer-inner { position: relative; z-index: 1; display: grid; max-width: 1200px; grid-template-columns: minmax(280px, 0.9fr) 1.7fr; gap: 64px; margin: 0 auto; padding: 10px 0 36px; }
    .brand-column { padding-right: 48px; border-right: 1px solid rgb(248 241 227 / 58%); }
    .footer-brand { display: inline-block; font-family: var(--font-display); font-size: 2rem; letter-spacing: 0.28em; text-decoration: none; text-transform: uppercase; }
    .brand-column h2 { margin: 12px 0 8px; font-family: var(--font-display); font-size: 1.45rem; font-weight: 500; }
    .brand-column > p { margin: 0; color: rgb(248 241 227 / 88%); font-size: 0.92rem; line-height: 1.5; }
    .social-heading { display: flex; align-items: center; gap: 18px; margin: 18px 0 12px; font-family: var(--font-display); font-size: 0.98rem; font-weight: 600; }
    .social-heading::after { width: 80px; height: 1px; background: rgb(248 241 227 / 62%); content: ''; }
    .social-links { display: flex; gap: 14px; }
    .social-links a { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 50%; background: rgb(248 241 227 / 18%); transition: background-color 150ms ease; }
    .social-links a:hover { background: rgb(248 241 227 / 30%); }
    .social-links svg { width: 21px; height: 21px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
    .social-links a:nth-child(2) svg { fill: currentColor; stroke: none; }
    .footer-links { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 36px; }
    .link-column { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
    .link-column h2 { margin: 0 0 4px; font-family: var(--font-display); font-size: 1.15rem; font-weight: 600; }
    .link-column a { color: rgb(248 241 227 / 92%); font-size: 0.9rem; line-height: 1.4; text-decoration: none; }
    .link-column a:hover, .footer-bottom a:hover { text-decoration: underline; text-underline-offset: 4px; }
    .footer-leaves { position: absolute; right: -8px; bottom: 86px; width: 150px; fill: rgb(248 241 227 / 9%); stroke: rgb(248 241 227 / 34%); stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
    .footer-bottom { position: relative; z-index: 1; display: grid; max-width: 1200px; grid-template-columns: 1.3fr 1fr auto; align-items: center; gap: 24px; margin: 0 auto; padding-top: 20px; border-top: 1px solid rgb(248 241 227 / 60%); }
    .copyright { font-size: 0.86rem; }
    .legal-links { display: flex; justify-content: center; gap: 28px; }
    .legal-links a, .back-to-top { display: inline-flex; align-items: center; gap: 8px; color: inherit; font-size: 0.86rem; text-decoration: none; white-space: nowrap; }
    .legal-links svg { width: 19px; height: 19px; fill: none; stroke: currentColor; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
    .back-to-top { justify-self: end; }
    .back-to-top span { display: grid; width: 30px; height: 30px; place-items: center; border-radius: 50%; background: var(--cream); color: var(--burgundy); font-size: 1.3rem; line-height: 1; }
    .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    :is(a, button, input):focus-visible { outline: 2px solid currentColor; outline-offset: 4px; }
    @media (max-width: 850px) {
      .newsletter-inner { grid-template-columns: 1fr; gap: 26px; }
      .footer-inner { grid-template-columns: 1fr; gap: 32px; }
      .brand-column { padding: 0 0 26px; border-right: 0; border-bottom: 1px solid rgb(248 241 227 / 50%); }
      .footer-bottom { grid-template-columns: 1fr auto; }
      .legal-links { grid-column: 1; grid-row: 2; justify-content: flex-start; }
      .back-to-top { grid-column: 2; grid-row: 1 / span 2; }
    }
    @media (max-width: 560px) {
      .newsletter { padding: 34px 20px 30px; }
      .newsletter-inner { gap: 20px; }
      .newsletter h2 { font-size: 2.1rem; }
      .desktop-break { display: none; }
      .subscribe-row { flex-direction: column; gap: 10px; }
      .email-field, .subscribe { min-height: 50px; border-radius: 12px; }
      .subscribe { width: 100%; }
      .newsletter-leaves { width: 100px; opacity: 0.6; }
      .footer-main { padding: 38px 20px 22px; }
      .footer-inner { gap: 26px; padding-bottom: 28px; }
      .footer-brand { font-size: 1.7rem; }
      .footer-links { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 26px 18px; }
      .link-column h2 { font-size: 1rem; }
      .link-column a { font-size: 0.82rem; }
      .footer-bottom { grid-template-columns: 1fr auto; gap: 18px 10px; }
      .copyright { grid-column: 1 / -1; font-size: 0.78rem; }
      .legal-links { flex-direction: column; gap: 10px; }
      .legal-links a, .back-to-top { font-size: 0.76rem; }
      .back-to-top { grid-column: 2; grid-row: 2; }
      .footer-leaves { width: 110px; opacity: 0.55; }
    }
  `,
})
export class SiteFooter {
  readonly brand = BRAND;

  keepPlaceholder(event: Event): void {
    event.preventDefault();
  }

  scrollToTop(event: Event): void {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
