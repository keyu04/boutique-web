import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { BRAND, ProductDetail, ProductsApi } from '@shared';
import { BagService } from '../../core/bag.service';
import { formatPageTitle } from '../../core/page-title';
import { SiteHeader } from '../../core/site-header';

type PageState = 'loading' | 'ready' | 'notfound' | 'error';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, RouterLink, SiteHeader],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ProductsApi);
  private readonly title = inject(Title);
  readonly bag = inject(BagService);
  readonly brand = BRAND;

  readonly state = signal<PageState>('loading');
  readonly product = signal<ProductDetail | null>(null);
  readonly imageIndex = signal(0);
  readonly selectedVariantId = signal<number | null>(null);
  readonly message = signal<string | null>(null);
  readonly added = signal(false);

  readonly activeImage = computed(() => this.product()?.images[this.imageIndex()] ?? null);
  readonly selectedSize = computed(
    () => this.product()?.sizes.find(s => s.variantId === this.selectedVariantId()) ?? null);
  readonly discount = computed(() => {
    const p = this.product();
    return p && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
  });

  constructor() {
    this.route.paramMap.pipe(
      map(params => params.get('slug') ?? ''),
      tap(() => {
        this.state.set('loading');
        this.imageIndex.set(0);
        this.selectedVariantId.set(null);
        this.message.set(null);
        this.added.set(false);
      }),
      switchMap(slug => this.api.getBySlug(slug).pipe(
        map(product => ({ product, status: 'ready' as PageState })),
        catchError((e: HttpErrorResponse) => of({
          product: null as ProductDetail | null,
          status: (e.status === 404 ? 'notfound' : 'error') as PageState,
        })),
      )),
      takeUntilDestroyed(),
    ).subscribe(({ product, status }) => {
      this.product.set(product);
      this.state.set(status);
      this.title.setTitle(formatPageTitle(product?.name ?? 'Product details'));
      const primary = product?.images.findIndex(i => i.isPrimary) ?? -1;
      if (primary > 0) this.imageIndex.set(primary);
    });
  }

  selectSize(variantId: number): void {
    this.selectedVariantId.set(variantId);
    this.message.set(null);
    this.added.set(false);
  }

  addToBag(p: ProductDetail): void {
    const size = this.selectedSize();
    if (!size) {
      this.added.set(false);
      this.message.set('Please choose a size.');
      return;
    }
    const image = p.images.find(i => i.isPrimary)?.url ?? p.images[0]?.url ?? null;
    const error = this.bag.add(
      { variantId: size.variantId, productId: p.id, slug: p.slug, name: p.name,
        image, size: size.size, price: p.price },
      size.stockQuantity,
    );
    this.message.set(error);
    this.added.set(error === null);
  }
}