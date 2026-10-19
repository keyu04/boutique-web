import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoriesApi, Category, ProductsApi, ProductSummary, BRAND } from '@shared';
import { RouterLink } from '@angular/router';
import { EMPTY, Subject, catchError, startWith, switchMap, tap } from 'rxjs';
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
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly categorySelection = new Subject<string | null>();

  readonly brand = BRAND;
  readonly categories = signal<Category[]>([]);
  readonly products = signal<ProductSummary[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly featured = signal<ProductSummary | null>(null);
  readonly selectedCategory = signal<string | null>(null);

  constructor() {
    this.categorySelection.pipe(
    tap(() => {
      this.loading.set(true);
      this.error.set(null);
    }),
    switchMap(category => this.api.list({
      category: category ?? undefined,
      pageSize: 12,
      sort: 'newest',
    }).pipe(
      catchError(() => {
        this.error.set('Could not load products. Is the API running?');
        this.loading.set(false);
        return EMPTY;
      }),
    )),
    takeUntilDestroyed(),
    ).subscribe(page => {
    this.products.set(page.items);
    if (!this.featured()) {
      this.featured.set(page.items.find(p => p.image) ?? null);
    }
    this.loading.set(false);
    });

    this.categoriesApi.list().pipe(takeUntilDestroyed()).subscribe({
    next: categories => {
      const order = ['Dresses', 'Kurta Sets', 'Kurtis', 'Co-ords', 'Tops'];
      const orderedCategories = [...categories].sort(
        (a, b) => order.indexOf(a.name) - order.indexOf(b.name),
      );
      this.categories.set(orderedCategories);
      this.categorySelection.next(null);
    },
    error: () => {
      this.error.set('Could not load collection categories.');
      this.loading.set(false);
    },
    });
  }

  selectCategory(category: Category): void {
    this.selectedCategory.set(category.slug);
    this.categorySelection.next(category.slug);
  }

  selectAllCategories(): void {
    this.selectedCategory.set(null);
    this.categorySelection.next(null);
  }
}