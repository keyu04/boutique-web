import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { BRAND, Page, apiMessage } from '@shared';
import { EMPTY, catchError, switchMap, tap } from 'rxjs';
import { AdminProductSummary } from '../../core/admin-models';
import { AdminProductsApi } from '../../core/admin-products.api';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-product-list',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductListPage {
  private readonly api = inject(AdminProductsApi);

  readonly page = signal(1);
  private readonly reloadTick = signal(0);
  readonly data = signal<Page<AdminProductSummary> | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly totalPages = computed(() => {
    const d = this.data();
    return d ? Math.max(1, Math.ceil(d.total / PAGE_SIZE)) : 1;
  });

  constructor() {
    inject(Title).setTitle(`Products | ${BRAND.name} Admin`);

    const query = computed(() => ({ page: this.page(), tick: this.reloadTick() }));
    toObservable(query).pipe(
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      // switchMap drops the old request if the page changes while it is still loading
      switchMap(({ page }) => this.api.list(page, PAGE_SIZE).pipe(
        catchError((e: HttpErrorResponse) => {
          this.error.set(apiMessage(e, 'Could not load products.'));
          this.loading.set(false);
          return EMPTY;
        }),
      )),
      takeUntilDestroyed(),
    ).subscribe(result => {
      this.data.set(result);
      this.loading.set(false);
    });
  }

  go(delta: number): void {
    this.page.update(p => Math.min(Math.max(p + delta, 1), this.totalPages()));
  }

  retry(): void {
    this.reloadTick.update(n => n + 1);
  }

  margin(p: AdminProductSummary): number {
    return p.price > 0 ? Math.round(((p.price - p.costPrice) / p.price) * 100) : 0;
  }
}