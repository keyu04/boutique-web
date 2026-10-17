import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ProductsApi, ProductSummary, BRAND } from '@shared';
import { RouterLink } from '@angular/router';
import { SiteHeader } from '../../core/site-header';
import { SiteFooter } from '../../core/site-footer';

@Component({
  selector: 'app-home',
  imports: [CurrencyPipe, RouterLink, SiteHeader, SiteFooter],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly api = inject(ProductsApi);

  readonly brand = BRAND;
  readonly products = signal<ProductSummary[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly featured = computed(() => this.products().find(p => p.image) ?? null);

  constructor() {
    this.api.list({ pageSize: 12, sort: 'newest' }).subscribe({
      next: page => {
        this.products.set(page.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load products. Is the API running?');
        this.loading.set(false);
      },
    });
  }
}