import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { formatPageTitle } from '../../core/page-title';
import { SiteFooter } from '../../core/site-footer';
import { SiteHeader } from '../../core/site-header';
import { INFO_PAGES } from './info-content';
import { SITE, SIZE_CHART } from './site-info';

interface Channel {
  title: string;
  text: string;
  label: string;
  href: string;
  icon: 'whatsapp' | 'instagram' | 'facebook' | 'email';
}

@Component({
  selector: 'app-info-page',
  imports: [RouterLink, SiteHeader, SiteFooter],
  template: `
    <app-site-header />
    <main class="info">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a routerLink="/">Home</a>
        <span class="crumb-separator" aria-hidden="true">›</span>
        <span aria-current="page">{{ page.title }}</span>
      </nav>

      @if (page.slug === 'our-story') {
        <header class="story-hero">
          <div class="story-copy">
            <p class="eyebrow">{{ page.eyebrow }}</p>
            <h1>{{ page.title }}</h1>
            <p class="intro">{{ page.intro }}</p>
          </div>
          <svg class="story-model" viewBox="0 0 420 480" role="img" fill="none"
               aria-label="Illustration of a woman wearing a maroon floral dress">
            <defs>
              <linearGradient id="story-backdrop" x1="65" y1="35" x2="351" y2="438" gradientUnits="userSpaceOnUse">
                <stop stop-color="#FCE9E1" />
                <stop offset="1" stop-color="#E9AFA2" />
              </linearGradient>
              <clipPath id="story-portrait">
                <path d="M38 480V190a172 172 0 0 1 344 0v290H38Z" />
              </clipPath>
            </defs>
            <path d="M38 480V190a172 172 0 0 1 344 0v290H38Z" fill="url(#story-backdrop)" />
            <g clip-path="url(#story-portrait)">
              <path d="M64 480c16-88 30-150 67-190l33-31h107l38 31c40 39 52 104 67 190H64Z" fill="#761A38" />
              <path d="M160 238v-38h100v38c0 28-22 49-50 49s-50-21-50-49Z" fill="#C77E62" />
              <path d="M160 210c-11-40-18-79-11-119 9-50 39-77 86-75 48 2 75 37 74 87-1 39-11 78-22 108l-14 40H168l-8-41Z" fill="#38232A" />
              <ellipse cx="224" cy="141" rx="57" ry="72" fill="#D99679" />
              <path d="M166 128c2-48 18-88 61-91 40-3 65 21 73 59-21-6-35-22-42-41-17 20-47 34-88 39l-4 34Z" fill="#38232A" />
              <path d="M168 151c-10-8-19 1-15 14 3 10 10 16 18 15m105-29c10-8 19 1 15 14-3 10-10 16-18 15" fill="#D99679" />
              <path d="M194 140c5-4 11-4 16 0m28 0c5-4 11-4 16 0" stroke="#57302F" stroke-width="3" stroke-linecap="round" />
              <path d="M199 151v1m47-1v1" stroke="#38232A" stroke-width="4" stroke-linecap="round" />
              <path d="m221 154-4 16 8 1" stroke="#B96F59" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M210 181c8 7 19 7 27 0" stroke="#8E3F48" stroke-width="3" stroke-linecap="round" />
              <circle cx="163" cy="190" r="5" fill="#E9BC78" />
              <circle cx="284" cy="190" r="5" fill="#E9BC78" />
              <path d="m172 257 51 35 43-35 33 31 39 192H89l43-192 40-31Z" fill="#761A38" />
              <path d="m172 257 51 35 43-35m-43 35v176" stroke="#A94B60" stroke-width="3" />
              <g fill="#F5D6C9">
                <circle cx="153" cy="329" r="4" /><circle cx="169" cy="343" r="3" />
                <circle cx="291" cy="320" r="4" /><circle cx="276" cy="349" r="3" />
                <circle cx="130" cy="395" r="3" /><circle cx="309" cy="403" r="4" />
                <circle cx="187" cy="381" r="4" /><circle cx="258" cy="388" r="3" />
              </g>
              <g stroke="#F5D6C9" stroke-width="2" stroke-linecap="round">
                <path d="M150 322v14m-7-7h14m-116 76 9 9m-9 0 9-9" />
                <path d="M291 313v14m-7-7h14m-25 46 8 8m-8 0 8-8" />
              </g>
              <path d="M176 304c-25 36-36 80-36 137m92-132c25 35 40 77 41 132" stroke="#F0B9A8" stroke-width="3" opacity=".8" />
            </g>
            <path d="M38 480V190a172 172 0 0 1 344 0v290" stroke="#D88C80" stroke-width="3" />
            <g stroke="#D88C80" stroke-width="2" stroke-linecap="round" opacity=".8">
              <path d="M355 88c21-31 34-55 42-79" />
              <path d="M381 58c-21 1-35-5-45-17 20-6 36 0 45 17Zm5-15c-2-19 4-32 15-42 7 18 2 33-15 42Z" />
              <path d="M35 221C18 194 10 174 7 151" />
              <path d="M18 194c18-4 29-13 35-27-19 0-31 10-35 27Zm-3-12c-10-14-12-27-7-41 13 10 16 24 7 41Z" />
            </g>
          </svg>
        </header>
      } @else {
        <header class="hero" [class.terms-hero]="page.slug === 'terms'">
          <p class="eyebrow">{{ page.eyebrow }}</p>
          <h1>{{ page.title }}</h1>
          <p class="intro">{{ page.intro }}</p>
          @if (page.showUpdated) { <p class="updated">Last updated: {{ site.updated }}</p> }
        </header>
      }

      @if (page.slug === 'size-guide') {
        <div class="size-guide">
          <section class="size-feature">
            <div class="card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v2l-9 6v2h18v-2l-9-6M5 17h14" />
              </svg>
            </div>
            <div>
              @for (s of sizeIntro; track s.title) {
                <h2>{{ s.title }}</h2>
                @for (p of s.body ?? []; track p) { <p>{{ p }}</p> }
              }
            </div>
            <svg class="measure-art" viewBox="0 0 180 110" aria-hidden="true">
              <path d="M19 80c22-54 57-68 105-45 18 9 30 18 42 17" fill="none" stroke="#D99083" stroke-width="24" stroke-linecap="round" />
              <path d="M19 80c22-54 57-68 105-45 18 9 30 18 42 17" fill="none" stroke="#FBE8E0" stroke-width="2" stroke-dasharray="2 8" />
              <circle cx="148" cy="54" r="22" fill="#F7D8CF" stroke="#D99083" stroke-width="3" />
              <circle cx="148" cy="54" r="8" fill="#FFF8F1" stroke="#D99083" stroke-width="2" />
            </svg>
          </section>

          <section class="size-measurements">
            <header class="size-section-heading">
              <p class="eyebrow">Fit guide</p>
              <h2>How to measure</h2>
              <p>Use a soft measuring tape and keep it comfortably level without pulling it tight.</p>
            </header>
            <div class="measurement-grid">
              @for (s of sizeMeasurements; track s.title) {
                <article class="card measurement-card">
                  <svg class="measure-sketch" viewBox="0 0 60 80" aria-hidden="true">
                    <path d="M22 8c0 5-2 8-7 11l-7 6 6 15-2 23 5 12h26l5-12-2-23 6-15-7-6c-5-3-7-6-7-11" />
                    <path d="M15 19c4 5 9 7 15 7s11-2 15-7M15 40c8 4 22 4 30 0M16 58c8 4 20 4 28 0" />
                    @switch (s.icon) {
                      @case ('bust') { <path class="measure-line" d="M10 32c10 6 30 6 40 0" /> }
                      @case ('waist') { <path class="measure-line" d="M12 48c9 5 27 5 36 0" /> }
                      @case ('hips') { <path class="measure-line" d="M10 63c10 6 30 6 40 0" /> }
                    }
                  </svg>
                  <div>
                    <h3>{{ s.title }}</h3>
                    @for (p of s.body ?? []; track p) { <p>{{ p }}</p> }
                  </div>
                </article>
              }
            </div>
          </section>

          <div class="size-details">
            <section class="card size-chart-panel">
              <div class="size-panel-heading">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 5h16v14H4zM8 5v4m4-4v3m4-3v4m-8 7h8" />
                </svg>
                <h2>Size chart</h2>
              </div>
              @if (sizeChart) {
                <table class="chart">
                  <thead><tr><th>Size</th><th>Bust (in)</th><th>Waist (in)</th><th>Hips (in)</th></tr></thead>
                  <tbody>
                    @for (r of sizeChart; track r.size) {
                      <tr><th>{{ r.size }}</th><td>{{ r.bust }}</td><td>{{ r.waist }}</td><td>{{ r.hips }}</td></tr>
                    }
                  </tbody>
                </table>
              } @else {
                <p class="chart-note">A full measurement chart is not available yet. Check each product page for size details, or contact us for help choosing a fit.</p>
              }
            </section>
            @for (s of sizeFit; track s.title) {
              <section class="card size-fit-card">
                <div class="card-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="m8 3 4 2 4-2 4 3-2 4-2-1 1 12H7L8 9 6 10 4 6l4-3Z" />
                    <path d="M10 5c0 2 4 2 4 0M8 13h8" />
                  </svg>
                </div>
                <div>
                  <h2>{{ s.title }}</h2>
                  @for (p of s.body ?? []; track p) { <p>{{ p }}</p> }
                </div>
              </section>
            }
          </div>
        </div>
      } @else {
        <div class="grid" [class.returns-grid]="page.slug === 'returns'"
             [class.privacy-grid]="page.slug === 'privacy'"
             [class.terms-grid]="page.slug === 'terms'">
          @for (s of page.sections; track s.title) {
            <section class="card" [class.has-icon]="s.icon">
              @if (s.icon) {
                <div class="card-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    @switch (s.icon) {
                      @case ('location') {
                        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                        <circle cx="12" cy="10" r="2.5" />
                      }
                      @case ('shipping') {
                        <path d="M2.5 6h12v11h-12zM14.5 10h4l3 3v4h-7z" />
                        <circle cx="7" cy="18" r="1.6" />
                        <circle cx="18" cy="18" r="1.6" />
                        <path d="M16 10v3h5M5 9h6" />
                      }
                      @case ('payment') {
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="M3 9h18m-14 6h4" />
                        <circle cx="17" cy="14" r="2" />
                      }
                      @case ('processing') {
                        <path d="M9 4H5v17h14V4h-4" />
                        <path d="M9 3h6v4H9zM8 12l1.5 1.5L12 11M8 17h8" />
                      }
                      @case ('delivery') {
                        <path d="m12 2 9 5v10l-9 5-9-5V7z" />
                        <path d="m3 7 9 5 9-5m-9 5v10m-4-17 9 5" />
                      }
                      @case ('tracking') {
                        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                        <circle cx="12" cy="10" r="2.5" />
                        <path d="M3 21h5m8 0h5" />
                      }
                      @case ('hanger') {
                        <circle cx="12" cy="5" r="2" />
                        <path d="M12 7v2l-9 6v2h18v-2l-9-6M5 17h14" />
                      }
                      @case ('heart') {
                        <path d="M20.8 8.7c0 5-8.8 11-8.8 11s-8.8-6-8.8-11a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2Z" />
                      }
                      @case ('sparkle') {
                        <path d="m12 2 1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
                      }
                      @case ('damaged') {
                        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
                        <path d="m4 7.5 8 4.5 8-4.5M12 12v9m0-14v3m0 4h.01" />
                      }
                      @case ('exchange') {
                        <path d="M20 7h-5V2m5 5-3-3a8 8 0 0 0-13 3M4 17h5v5m-5-5 3 3a8 8 0 0 0 13-3" />
                      }
                      @case ('whatsapp') {
                        <path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6Z" />
                        <path d="M9 8.5c.5 2 2 3.5 4.5 4.5l1-1 2 1c-.2 1.4-1.3 2-2.6 1.8-3.5-.6-6.2-3.3-6.8-6.8C7 6.7 7.6 5.6 9 5.4l1 2-1 1.1Z" />
                      }
                      @case ('not-eligible') {
                        <circle cx="12" cy="12" r="9" />
                        <path d="m5.6 5.6 12.8 12.8" />
                      }
                      @case ('personal-info') {
                        <circle cx="9" cy="8" r="3" />
                        <path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6m2-12h4v12h-4m1-8h2m-2 4h2" />
                      }
                      @case ('privacy-cart') {
                        <path d="M3 4h2l2.2 11h10.5l2-8H6" />
                        <circle cx="9" cy="19" r="1" />
                        <circle cx="17" cy="19" r="1" />
                      }
                      @case ('sharing') {
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="6" r="3" />
                        <circle cx="18" cy="18" r="3" />
                        <path d="m9 11 6-4m-6 6 6 4" />
                      }
                      @case ('privacy-shield') {
                        <path d="m12 3 8 3v5c0 5-3.4 8-8 10-4.6-2-8-5-8-10V6l8-3Z" />
                        <path d="m9 12 2 2 4-4" />
                      }
                      @case ('privacy-contact') {
                        <path d="M4 13v-2a8 8 0 0 1 16 0v2m-16-1H3v6h4v-6H4Zm16 0h1v6h-4v-6h3Zm-3 6c0 2-2 3-5 3" />
                        <circle cx="12" cy="21" r="1" />
                      }
                      @case ('price-tag') {
                        <path d="m20.6 13.4-7.2 7.2a2 2 0 0 1-2.8 0l-7.2-7.2V4h9.4l7.8 7.8a1.1 1.1 0 0 1 0 1.6Z" />
                        <circle cx="8" cy="8" r="1.5" />
                      }
                      @case ('orders') {
                        <path d="M3 4h2l2.2 11h10.5l2-8H6" />
                        <circle cx="9" cy="19" r="1.5" />
                        <circle cx="17" cy="19" r="1.5" />
                        <path d="M9 10h7" />
                      }
                      @case ('product-info') {
                        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
                        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
                      }
                      @case ('terms-law') {
                        <path d="M12 3v17m-7 0h14M5 7h14m-14 0-3 6h6L5 7Zm14 0-3 6h6l-3-6Z" />
                        <path d="M9 21h6" />
                      }
                      @case ('terms-change') {
                        <path d="M5 3h10l4 4v14H5z" />
                        <path d="M14 3v5h5m-10 4h6m-6 4h4m2.5 2.5 3-3 1.5 1.5-3 3-2 .5.5-2Z" />
                      }
                    }
                  </svg>
                </div>
              }
              <h2>{{ s.title }}</h2>
              @for (p of s.body ?? []; track p) { <p>{{ p }}</p> }
              @if (s.bullets) { <ul>@for (b of s.bullets; track b) { <li>{{ b }}</li> }</ul> }
            </section>
          }
        </div>
      }

      @if (page.slug === 'contact') {
        <div class="grid contact-grid">
          @for (c of channels; track c.title) {
            <section class="card has-icon">
              <div class="card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  @switch (c.icon) {
                    @case ('whatsapp') {
                      <path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6Z" />
                      <path d="M9 8.5c.5 2 2 3.5 4.5 4.5l1-1 2 1c-.2 1.4-1.3 2-2.6 1.8-3.5-.6-6.2-3.3-6.8-6.8C7 6.7 7.6 5.6 9 5.4l1 2-1 1.1Z" />
                    }
                    @case ('instagram') {
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <path d="M17.5 6.5h.01" />
                    }
                    @case ('facebook') {
                      <path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h1.7V1.4C17 1.2 15.8 1 14.5 1 11 1 9 3.1 9 6.8V9H6v4h3v8h5Z" />
                    }
                    @case ('email') {
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    }
                  }
                </svg>
              </div>
              <h2>{{ c.title }}</h2>
              <p>{{ c.text }}</p>
              <a class="btn" [href]="c.href" target="_blank" rel="noopener">
                <svg class="channel-icon" [class.facebook-icon]="c.icon === 'facebook'" viewBox="0 0 24 24" aria-hidden="true">
                  @switch (c.icon) {
                    @case ('whatsapp') {
                      <path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6Z" />
                      <path d="M9 8.5c.5 2 2 3.5 4.5 4.5l1-1 2 1c-.2 1.4-1.3 2-2.6 1.8-3.5-.6-6.2-3.3-6.8-6.8C7 6.7 7.6 5.6 9 5.4l1 2-1 1.1Z" />
                    }
                    @case ('instagram') {
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <path d="M17.5 6.5h.01" />
                    }
                    @case ('facebook') {
                      <path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h1.7V1.4C17 1.2 15.8 1 14.5 1 11 1 9 3.1 9 6.8V9H6v4h3v8h5Z" />
                    }
                    @case ('email') {
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    }
                  }
                </svg>
                <span>{{ c.label }}</span>
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13m-5-5 5 5-5 5" /></svg>
              </a>
            </section>
          }
        </div>
        <p class="hours">
          <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5" /><path d="M10 5v5l3 2" /></svg>
          We typically reply within a few hours · {{ site.hours }}
        </p>
      }

      <aside class="help">
        <div class="help-copy">
          <h2>{{ page.help.title }}</h2>
          <p>{{ page.help.text }}</p>
        </div>
        <svg class="help-art" viewBox="0 0 320 180" aria-hidden="true">
            <defs>
              <pattern id="help-fabric" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="m16 3 5 5-5 5-5-5 5-5Zm0 16 5 5-5 5-5-5 5-5Z" fill="none" stroke="#9e425d" stroke-width="1.5" opacity=".48" />
                <circle cx="3" cy="3" r="1.5" fill="#9e425d" opacity=".5" />
                <circle cx="29" cy="29" r="1.5" fill="#9e425d" opacity=".5" />
              </pattern>
            </defs>
            <path d="M95 180c26-47 55-87 107-91 45-4 77 17 118 1v90H95Z" fill="#efb9ae" />
            <path d="M132 180c28-50 47-79 88-82 36-3 69 14 100 1v81H132Z" fill="url(#help-fabric)" />
            <path d="M15 173c16-34 34-56 57-74m-46 40c-4-16-1-29 9-38 10 13 8 26-9 38Zm15-22c1-17 8-28 22-33 2 16-6 27-22 33Zm9-20c-5-16-2-29 9-39 9 14 6 27-9 39Zm11 1c6-15 17-22 31-22-4 15-15 23-31 22Z" fill="none" stroke="#b97468" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
            <g fill="#fff7ed" stroke="#d99083" stroke-width="1.5">
              <circle cx="49" cy="64" r="6" /><circle cx="42" cy="70" r="6" /><circle cx="55" cy="71" r="6" /><circle cx="49" cy="78" r="6" />
              <circle cx="78" cy="88" r="5" /><circle cx="72" cy="93" r="5" /><circle cx="84" cy="94" r="5" /><circle cx="78" cy="99" r="5" />
            </g>
            <g fill="#d99083"><circle cx="49" cy="71" r="2.5" /><circle cx="78" cy="94" r="2" /></g>
        </svg>
        @if (page.slug === 'our-story') {
          <a class="btn" routerLink="/">
            Browse collection
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13m-5-5 5 5-5 5" /></svg>
          </a>
        } @else {
          <a class="btn" [href]="helpHref" target="_blank" rel="noopener">
            @if (whatsappHref) {
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6Z" />
                <path d="M9 8.5c.5 2 2 3.5 4.5 4.5l1-1 2 1c-.2 1.4-1.3 2-2.6 1.8-3.5-.6-6.2-3.3-6.8-6.8C7 6.7 7.6 5.6 9 5.4l1 2-1 1.1Z" />
              </svg>
            }
            Contact us
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13m-5-5 5 5-5 5" /></svg>
          </a>
        }
      </aside>
    </main>
    <app-site-footer />
  `,
  styles: `
    .info { max-width: 1080px; margin: 0 auto; padding: 24px 16px 64px; color: var(--ink, #3a1a24); }
    .crumbs { display: flex; width: fit-content; max-width: 100%; align-items: center; gap: 9px;
      margin: 0 0 24px; padding: 7px 12px; border: 1px solid rgba(107,26,51,.1); border-radius: 999px;
      background: rgba(255,255,255,.42); color: var(--muted, #7a5a63); font-size: .9rem; line-height: 1.4; }
    .crumbs a { color: var(--maroon, #6b1a33); font-weight: 500; text-decoration: none; }
    .crumbs a:hover { color: var(--maroon, #6b1a33); text-decoration: underline; text-underline-offset: 3px; }
    .crumbs a:focus-visible { outline: 2px solid var(--maroon, #6b1a33); outline-offset: 3px; border-radius: 2px; }
    .crumb-separator { color: rgba(107,26,51,.45); }
    .crumbs [aria-current='page'] { color: var(--ink, #3a1a24); font-weight: 500; overflow-wrap: anywhere; }
    .hero { text-align: center; max-width: 720px; margin: 0 auto 32px; }
    .terms-hero { max-width: 900px; margin-bottom: 24px; }
    .terms-hero h1 { font-size: clamp(1.7rem, 3vw, 2.2rem); }
    .terms-hero .intro { font-size: 1rem; }
    .story-hero { display: grid; max-width: 900px; grid-template-columns: 1fr .85fr; align-items: center;
      gap: 32px; margin: 0 auto 32px; }
    .story-copy h1 { max-width: 560px; font-size: clamp(2.2rem, 4vw, 3.5rem); line-height: 1.08; }
    .story-copy .intro { max-width: 580px; font-size: 1rem; }
    .story-model { display: block; width: 100%; max-height: 340px; object-fit: contain; }
    .eyebrow { letter-spacing: .12em; text-transform: uppercase; font-size: .8rem; margin: 0 0 8px; }
    h1 { font-size: clamp(2rem, 5vw, 3rem); margin: 0 0 12px; color: var(--maroon, #6b1a33); }
    .intro { font-size: 1.05rem; line-height: 1.6; margin: 0; }
    .updated { font-size: .85rem; margin-top: 12px; opacity: .75; }
    .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); margin-bottom: 24px; }
    .size-guide { display: grid; gap: 24px; }
    .size-feature { display: grid; grid-template-columns: 56px minmax(0, 1fr) 180px; align-items: center;
      gap: 16px; padding: 18px 22px; border: 1px solid rgba(107,26,51,.12); border-radius: 18px;
      background: rgba(255,255,255,.55); }
    .size-feature .card-icon { margin: 0; }
    .size-feature h2 { margin: 0 0 6px; color: var(--maroon, #6b1a33); }
    .size-feature p { margin: 0; line-height: 1.55; }
    .measure-art { width: 100%; max-height: 110px; }
    .size-section-heading { margin: 0 auto; text-align: center; }
    .size-section-heading h2 { margin: 0 0 6px; color: var(--maroon, #6b1a33); }
    .size-section-heading > p:last-child { margin: 0; }
    .measurement-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    .measurement-card { display: grid; grid-template-columns: 68px minmax(0, 1fr); align-items: center; gap: 12px; }
    .measure-sketch { width: 64px; height: 76px; padding-right: 8px; border-right: 1px solid rgba(107,26,51,.25);
      fill: none; stroke: var(--maroon, #6b1a33); stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
    .measure-sketch .measure-line { stroke: #d99083; stroke-width: 2; stroke-dasharray: 3 2; }
    .measurement-card h3 { margin: 0 0 4px; color: var(--maroon, #6b1a33); }
    .measurement-card p { margin: 0; font-size: .9rem; }
    .size-details { display: grid; grid-template-columns: 1.2fr 1fr; align-items: stretch; gap: 16px; }
    .size-chart-panel, .size-fit-card { padding: 20px; }
    .size-panel-heading { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .size-panel-heading svg { width: 24px; height: 24px; flex: 0 0 auto; fill: none;
      stroke: var(--maroon, #6b1a33); stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
    .size-panel-heading h2, .size-fit-card h2 { margin: 0; color: var(--maroon, #6b1a33); }
    .chart-note { margin: 0; line-height: 1.6; }
    .size-fit-card { display: flex; align-items: flex-start; gap: 14px; background: rgba(255,210,200,.4); }
    .size-fit-card .card-icon { flex: 0 0 56px; margin: 0; }
    .size-fit-card p { margin: 6px 0 0; line-height: 1.55; }
    .card { background: rgba(255,255,255,.6); border: 1px solid rgba(107,26,51,.15); border-radius: 16px; padding: 20px; }
    .card.has-icon { text-align: center; }
    .returns-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .returns-grid .card { display: grid; grid-template-columns: 56px minmax(0, 1fr); align-content: start;
      align-items: start; column-gap: 14px; text-align: left; }
    .returns-grid .card-icon { margin: 0; }
    .returns-grid .card > :not(.card-icon) { grid-column: 2; }
    .privacy-grid, .terms-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .privacy-grid .card, .terms-grid .card { display: grid; grid-template-columns: 42px minmax(0, 1fr); align-content: start;
      align-items: start; column-gap: 10px; padding: 16px; text-align: left; }
    .terms-grid { gap: 12px; margin-bottom: 0; }
    .terms-grid .card { padding: 14px; }
    .privacy-grid .card-icon, .terms-grid .card-icon { width: 42px; height: 42px; margin: 0; }
    .privacy-grid .card-icon svg, .terms-grid .card-icon svg { width: 24px; height: 24px; }
    .privacy-grid .card > :not(.card-icon), .terms-grid .card > :not(.card-icon) { grid-column: 2; }
    .card-icon { display: grid; width: 56px; height: 56px; place-items: center; margin: 0 auto 12px;
      border-radius: 50%; background: rgba(255,210,200,.55); color: var(--maroon, #6b1a33); }
    .card-icon svg { width: 30px; height: 30px; fill: none; stroke: currentColor; stroke-width: 1.7;
      stroke-linecap: round; stroke-linejoin: round; }
    .contact-grid .card { display: flex; flex-direction: column; align-items: center; text-align: center; }
    .contact-grid .card p { flex: 1; }
    .contact-grid .btn { display: inline-flex; width: 100%; align-items: center; justify-content: center;
      gap: 8px; margin-top: 8px; }
    .contact-grid .btn svg { width: 18px; height: 18px; flex: 0 0 auto; fill: none; stroke: currentColor;
      stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
    .contact-grid .btn .facebook-icon { fill: currentColor; stroke: none; }
    .contact-grid .btn span { min-width: 0; overflow-wrap: anywhere; }
    .card h2 { font-size: 1.15rem; margin: 0 0 8px; color: var(--maroon, #6b1a33); }
    .card p, .card li { line-height: 1.6; margin: 0 0 8px; }
    .card ul { margin: 0; padding-left: 20px; }
    .chart { width: 100%; border-collapse: collapse; margin: 0 0 24px; background: rgba(255,255,255,.6); }
    .chart th, .chart td { border: 1px solid rgba(107,26,51,.2); padding: 10px; text-align: center; }
    .chart thead th { background: var(--maroon, #6b1a33); color: #fff; }
    .hours { display: flex; width: fit-content; max-width: 100%; align-items: center; justify-content: center;
      gap: 8px; margin: 24px auto 0; padding: 10px 18px; border-radius: 999px;
      background: rgba(255,210,200,.45); color: var(--maroon, #6b1a33); text-align: center; }
    .hours svg { width: 18px; height: 18px; flex: 0 0 auto; fill: none; stroke: currentColor;
      stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
    .help { position: relative; display: flex; min-height: 126px; align-items: center; justify-content: space-between;
      gap: 20px; margin-top: 24px; padding: 22px 30px; overflow: hidden; border-radius: 24px;
      background: linear-gradient(105deg, #f8e6dd, #f5ddd3); }
    .help-copy { position: relative; z-index: 1; flex: 1 1 auto; min-width: 0; max-width: 67%; }
    .help h2 { margin: 0 0 4px; color: var(--maroon, #6b1a33); font-size: 1.65rem; }
    .help p { max-width: 740px; margin: 0; }
    .btn { display: inline-block; background: var(--maroon, #6b1a33); color: #fff; text-decoration: none;
           padding: 10px 18px; border-radius: 10px; }
    .help-art { position: absolute; right: 145px; bottom: 0; width: 190px; height: 100%; pointer-events: none; }
    .help .btn { position: relative; z-index: 1; display: inline-flex; flex: 0 0 auto; align-items: center;
      justify-content: center; gap: 8px; margin-left: auto; padding: 12px 20px; border-radius: 12px; white-space: nowrap; }
    .help .btn svg { width: 18px; height: 18px; flex: 0 0 auto; fill: none; stroke: currentColor; stroke-width: 1.5;
      stroke-linecap: round; stroke-linejoin: round; }
    @media (max-width: 700px) {
      .story-hero { grid-template-columns: 1fr; gap: 8px; }
      .story-copy { text-align: center; }
      .story-copy h1, .story-copy .intro { margin-right: auto; margin-left: auto; }
      .story-model { width: min(100%, 360px); max-height: 300px; margin: 0 auto; }
      .returns-grid { grid-template-columns: 1fr; }
      .privacy-grid, .terms-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .help { flex-wrap: wrap; padding: 22px; }
      .help-copy { max-width: calc(100% - 110px); flex-basis: 100%; padding-right: 36px; }
      .help-art { right: 0; width: 42%; opacity: .28; }
      .help .btn { margin-left: 0; }
      .size-feature { grid-template-columns: 56px minmax(0, 1fr); }
      .measure-art { grid-column: 1 / -1; width: min(100%, 220px); justify-self: center; }
      .measurement-grid, .size-details { grid-template-columns: 1fr; }
    }
    @media (max-width: 560px) {
      .crumbs { gap: 7px; margin-bottom: 18px; font-size: .84rem; }
      .privacy-grid, .terms-grid { grid-template-columns: 1fr; }
      .help { padding: 20px; }
      .help-copy { max-width: 100%; padding-right: 0; }
      .help-art { width: 50%; height: 90px; opacity: .2; }
      .help .btn { margin-top: 14px; }
    }
  `,
})
export class InfoPage {
  private readonly slug = inject(ActivatedRoute).snapshot.data['slug'] as string;
  readonly page = INFO_PAGES[this.slug];
  readonly site = SITE;
  readonly sizeChart = SIZE_CHART;
  readonly whatsappHref = /^\d{10,15}$/.test(SITE.whatsapp) ? `https://wa.me/${SITE.whatsapp}` : null;
  readonly sizeIntro = INFO_PAGES['size-guide'].sections.slice(0, 1);
  readonly sizeMeasurements = INFO_PAGES['size-guide'].sections.slice(1, 4);
  readonly sizeFit = INFO_PAGES['size-guide'].sections.slice(4);

  readonly helpHref = this.whatsappHref ?? `mailto:${SITE.email}`;

  readonly channels: Channel[] = [
    ...(/^\d{10,15}$/.test(SITE.whatsapp)
      ? [{ title: 'WhatsApp', text: 'Chat with us about a product, your order or delivery.', label: 'Chat on WhatsApp', href: `https://wa.me/${SITE.whatsapp}`, icon: 'whatsapp' as const }]
      : []),
    ...(SITE.instagram
      ? [{ title: 'Instagram', text: 'New arrivals, styling inspiration and our latest collections.', label: 'Follow us on Instagram', href: SITE.instagram, icon: 'instagram' as const }]
      : []),
    ...(SITE.facebook
      ? [{ title: 'Facebook', text: 'Follow our page for updates.', label: 'Visit our Facebook page', href: SITE.facebook, icon: 'facebook' as const }]
      : []),
    { title: 'Email', text: 'For order support or any other questions.', label: SITE.email, href: `mailto:${SITE.email}`, icon: 'email' },
  ];

  constructor() {
    inject(Title).setTitle(formatPageTitle(this.page.title));
  }
}
