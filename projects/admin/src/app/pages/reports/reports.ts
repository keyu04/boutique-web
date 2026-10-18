import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BRAND, apiMessage } from '@shared';
import { ReportsApi } from '../../core/admin-orders.api';
import { ReportSummary } from '../../core/order-models';

const STATUS_ORDER = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
const COUNTED = ['Confirmed', 'Packed', 'Shipped', 'Delivered']; // statuses that count towards revenue

/** Today (UTC) plus an offset, as yyyy-MM-dd. The API works in UTC dates. */
function isoDay(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-reports',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class ReportsPage {
  private readonly api = inject(ReportsApi);

  readonly from = signal('');
  readonly to = signal('');
  readonly data = signal<ReportSummary | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly rows = computed(() => {
    const d = this.data();
    if (!d) return [];
    const counts = STATUS_ORDER.map(s => d.ordersByStatus[s] ?? 0);
    const max = Math.max(1, ...counts);
    return STATUS_ORDER.map((status, i) => ({
      status,
      count: counts[i],
      width: (counts[i] / max) * 100,
      counted: COUNTED.includes(status),
    }));
  });

  constructor() {
    inject(Title).setTitle(`Reports | ${BRAND.name} Admin`);
    this.load(); // no dates: the API picks the last 30 days and tells us which
  }

  apply(event: Event): void {
    event.preventDefault();
    const from = this.from();
    const to = this.to();
    if (!from || !to) {
      this.error.set('Choose both dates.');
      return;
    }
    if (from > to) {
      this.error.set('The start date must be on or before the end date.');
      return;
    }
    this.load(from, to);
  }

  preset(days: number | 'month'): void {
    const to = isoDay(0);
    const from = days === 'month' ? `${to.slice(0, 8)}01` : isoDay(-(days - 1));
    this.from.set(from);
    this.to.set(to);
    this.load(from, to);
  }

  private load(from?: string, to?: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.summary(from, to).subscribe({
      next: report => {
        this.data.set(report);
        this.from.set(report.from);
        this.to.set(report.to);
        this.loading.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(apiMessage(e, 'Could not load the report.'));
        this.loading.set(false);
      },
    });
  }
}