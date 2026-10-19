import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { BRAND, Page, apiMessage } from '@shared';
import { EMPTY, catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs';
import { AdminOrdersApi } from '../../core/admin-orders.api';
import { AdminOrderSummary } from '../../core/order-models';
import { StatusBadge } from '../../core/status-badge';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-order-list',
  imports: [CurrencyPipe, DatePipe, RouterLink, StatusBadge],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss',
})
export class OrderListPage {
  private readonly api = inject(AdminOrdersApi);
  private readonly router = inject(Router);
  readonly brand = BRAND;

  readonly statuses = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

  readonly searchText = signal('');
  readonly q = signal('');
  readonly status = signal(
    (() => {
      const s = inject(ActivatedRoute).snapshot.queryParamMap.get('status');
      return s && this.statuses.includes(s) ? s : '';
    })(),
  );
  readonly from = signal('');
  readonly to = signal('');
  readonly page = signal(1);
  private readonly reloadTick = signal(0);
  readonly data = signal<Page<AdminOrderSummary> | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly hasFilters = computed(() => !!(this.q() || this.status() || this.from() || this.to()));
  readonly statusTitle = computed(() => this.status() ? `${this.status()} orders` : 'All orders');
  readonly pendingPayments = computed(() =>
    this.data()?.items.filter(order => order.paymentStatus.toLowerCase() === 'pending').length ?? 0,
  );

  /** The orders API may not send a total, so treat it as optional. */
  readonly total = computed(() => {
    const t = (this.data() as { total?: unknown } | null)?.total;
    return typeof t === 'number' ? t : null;
  });

  readonly hasNext = computed(() => {
    const d = this.data();
    if (!d) return false;
    const total = this.total();
    return total !== null ? this.page() * PAGE_SIZE < total : d.items.length === PAGE_SIZE;
  });

  readonly showingFrom = computed(() => {
    const items = this.data()?.items ?? [];
    return items.length ? (this.page() - 1) * PAGE_SIZE + 1 : 0;
  });

  readonly showingTo = computed(() => {
    const items = this.data()?.items ?? [];
    const pageEnd = (this.page() - 1) * PAGE_SIZE + items.length;
    const total = this.total();
    return total === null ? pageEnd : Math.min(pageEnd, total);
  });

  readonly pageCount = computed(() => {
    const total = this.total();
    return total === null ? (this.hasNext() ? null : this.page()) : Math.max(1, Math.ceil(total / PAGE_SIZE));
  });

  constructor() {
    inject(Title).setTitle(`Orders | ${BRAND.name} Admin`);

    toObservable(this.searchText).pipe(
      debounceTime(300),
      map(text => text.trim()),
      distinctUntilChanged(),
      takeUntilDestroyed(),
    ).subscribe(text => {
      this.q.set(text);
      this.page.set(1);
    });

    const query = computed(() => ({
      page: this.page(), q: this.q(), status: this.status(),
      from: this.from(), to: this.to(), tick: this.reloadTick(),
    }));
    toObservable(query).pipe(
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap(({ page, q, status, from, to }) => this.api.list(page, PAGE_SIZE, { q, status, from, to }).pipe(
        catchError((e: HttpErrorResponse) => {
          this.error.set(apiMessage(e, 'Could not load orders.'));
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

  setStatus(value: string): void { this.status.set(value); this.page.set(1); }
  setFrom(value: string): void { this.from.set(value); this.page.set(1); }
  setTo(value: string): void { this.to.set(value); this.page.set(1); }

  clearFilters(): void {
    this.searchText.set('');
    this.q.set('');
    this.status.set('');
    this.from.set('');
    this.to.set('');
    this.page.set(1);
  }

  go(delta: number): void {
    this.page.update(p => Math.max(p + delta, 1));
  }

  openOrderRow(event: Event, id: number): void {
    if (event.target instanceof Element && event.target.closest('a')) return;
    void this.router.navigate(['/orders', id]);
  }

  retry(): void {
    this.reloadTick.update(n => n + 1);
  }

  paymentLabel(method: string): string {
    return method === 'Cod' ? 'Cash on delivery' : method;
  }
}