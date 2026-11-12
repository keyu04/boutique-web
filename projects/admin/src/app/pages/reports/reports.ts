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

const MONTH_FORMAT = new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' });

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
  readonly selectedMonth = signal('');
  private readonly now = new Date();
  readonly currentYear = this.now.getUTCFullYear();
  readonly months = Array.from({ length: this.now.getUTCMonth() + 1 }, (_, offset) => {
    const monthIndex = this.now.getUTCMonth() - offset;
    return {
      value: String(monthIndex + 1),
      label: MONTH_FORMAT.format(new Date(Date.UTC(this.currentYear, monthIndex, 1))),
    };
  });
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
  /** Shipping we collected minus what the couriers charge us (negative means we subsidise delivery). */
  readonly shippingNet = computed(() => {
    const d = this.data();
    return d ? d.shippingCollected - d.shippingCost : 0;
  });

  constructor() {
    inject(Title).setTitle(`Reports | ${BRAND.name} Admin`);
    this.load(); // no dates: the API picks the last 30 days and tells us which
  }

  apply(event: Event): void {
    event.preventDefault();
    this.selectedMonth.set('');
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
    this.selectedMonth.set('');
    const to = isoDay(0);
    const from = days === 'month' ? `${to.slice(0, 8)}01` : isoDay(-(days - 1));
    this.from.set(from);
    this.to.set(to);
    this.load(from, to);
  }

  selectMonth(value: string): void {
    this.selectedMonth.set(value);
    const month = Number(value);
    if (!Number.isInteger(month) || month < 1 || month > 12) return;

    const from = `${this.currentYear}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(Date.UTC(this.currentYear, month, 0)).getUTCDate();
    const to = `${this.currentYear}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
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
