import { CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ProductsApi, ProductSummary } from '@shared';
import { EMPTY, expand, reduce } from 'rxjs';
import { FavoritesService } from '../../core/favorites.service';
import { formatPageTitle } from '../../core/page-title';
import { SiteFooter } from '../../core/site-footer';
import { SiteHeader } from '../../core/site-header';

@Component({
  selector: 'app-wishlist',
  imports: [CurrencyPipe, RouterLink, SiteHeader, SiteFooter],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss',
})
export class WishlistPage {
  private readonly api = inject(ProductsApi);
  private readonly destroyRef = inject(DestroyRef);
  readonly favorites = inject(FavoritesService);
  private readonly allProducts = signal<ProductSummary[]>([]);
  readonly products = computed(() => {
    const ids = new Set(this.favorites.productIds());
    return this.allProducts().filter(product => ids.has(product.id));
  });
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    inject(Title).setTitle(formatPageTitle('Your wishlist'));

    if (this.favorites.productIds().length === 0) {
      this.loading.set(false);
      return;
    }

    this.api.list({ page: 1, pageSize: 100 }).pipe(
      expand(page =>
        page.items.length > 0 && page.page * page.pageSize < page.total
          ? this.api.list({ page: page.page + 1, pageSize: 100 })
          : EMPTY,
      ),
      reduce((items, page) => [...items, ...page.items], [] as ProductSummary[]),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: products => {
        this.allProducts.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your wishlist. Please try again.');
        this.loading.set(false);
      },
    });
  }

  remove(productId: number): void {
    this.favorites.toggle(productId);
  }

  discountPercent(product: ProductSummary): number {
    return product.mrp > product.price && product.mrp > 0
      ? Math.round((product.mrp - product.price) / product.mrp * 100)
      : 0;
  }
}
