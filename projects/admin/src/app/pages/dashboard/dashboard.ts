import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { BRAND } from '@shared';
import { catchError, of } from 'rxjs';
import { AdminOrdersApi, ReportsApi } from '../../core/admin-orders.api';
import { AuthService } from '../../core/auth.service';
import { AdminOrderSummary, ReportSummary } from '../../core/order-models';

const PAGE = 20;

interface Queue {
  status: string;
  title: string;
  hint: string;
  count: number | null;
  more: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, RouterLink],
  template: `
    <h1>Welcome back, {{ auth.displayName() }}</h1>
    <p class="muted">Here is what needs doing today.</p>

    @if (failed()) {
      <p class="err" role="alert">Some numbers could not be loaded. Refresh the page to try again.</p>
    }

    <section aria-labelledby="todo">
      <h2 id="todo">Orders to work on</h2>
      <div class="queues">
        @for (q of queues(); track q.status) {
          <a class="tile queue" routerLink="/orders" [queryParams]="{ status: q.status }">
            <span class="label">{{ q.title }}</span>
            <span class="value">{{ q.count === null ? '–' : q.count }}{{ q.more ? '+' : '' }}</span>
            <span class="sub">{{ q.hint }}</span>
          </a>
        }
      </div>
    </section>

    @if (latest().length > 0) {
      <section class="card" aria-labelledby="latest">
        <h2 id="latest">Newest orders waiting to be confirmed</h2>
        <ul class="latest">
          @for (o of latest(); track o.id) {
            <li>
              <a [routerLink]="['/orders', o.id]"><strong>{{ o.orderNumber }}</strong></a>
              <span>{{ o.customerName }}, {{ o.city }}</span>
              <span class="muted">{{ o.createdAt | date: 'd MMM, h:mm a' }}</span>
              <span class="amt">{{ o.total | currency: 'INR' : 'symbol' : '1.0-0' }}</span>
            </li>
          }
        </ul>
      </section>
    }

    @if (auth.isAdmin() && report(); as r) {
      <section aria-labelledby="month">
        <h2 id="month">Last 30 days</h2>
        <div class="queues">
          <div class="tile"><span class="label">Orders</span><span class="value">{{ r.orderCount }}</span></div>
          <div class="tile"><span class="label">Item revenue</span><span class="value">{{ r.itemRevenue | currency: 'INR' : 'symbol' : '1.0-0' }}</span></div>
          <div class="tile">
            <span class="label">Margin</span>
            <span class="value">{{ r.margin | currency: 'INR' : 'symbol' : '1.0-0' }}</span>
            <span class="sub">{{ r.marginPercent | number: '1.0-1' }}% of item revenue</span>
          </div>
        </div>
        <p class="muted">{{ r.from }} to {{ r.to }}. <a routerLink="/reports">Open full report</a></p>
      </section>
    }
  `,
  styles: `
    :host { display: block; }
    h1 { margin: 0 0 4px; font-family: var(--font-display); font-weight: 500; font-size: 2.2rem; }
    h2 { margin: 32px 0 16px; font-family: var(--font-display); font-weight: 500; font-size: 1.3rem; }
    .muted { color: var(--muted); }
    .err { margin: 16px 0 0; font-weight: 600; }
    .queues { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .tile { display: flex; flex-direction: column; gap: 6px; background: #fff; border-radius: 12px; padding: 20px 22px; color: inherit; text-decoration: none; }
    .queue:hover { box-shadow: 0 0 0 2px var(--burgundy); }
    .queue:focus-visible, a:focus-visible { outline: 3px solid var(--burgundy); outline-offset: 2px; }
    .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted); font-weight: 600; }
    .value { font-family: var(--font-display); font-size: 2.2rem; }
    .sub { font-size: 0.85rem; color: var(--muted); }
    .card { background: #fff; border-radius: 12px; padding: 8px 24px 16px; margin-top: 24px; }
    .card h2 { margin-top: 16px; }
    .latest { list-style: none; margin: 0; padding: 0; }
    .latest li { display: grid; grid-template-columns: 170px 1fr auto 80px; gap: 16px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--blush); }
    .latest li:last-child { border-bottom: 0; }
    .latest a { color: inherit; }
    .amt { text-align: right; font-weight: 600; }
    @media (max-width: 700px) { .latest li { grid-template-columns: 1fr auto; } }
  `,
})
export class DashboardPage {
  readonly auth = inject(AuthService);
  private readonly orders = inject(AdminOrdersApi);
  private readonly reports = inject(ReportsApi);

  readonly queues = signal<Queue[]>([
    { status: 'Pending', title: 'To confirm', hint: 'New orders waiting for a decision', count: null, more: false },
    { status: 'Confirmed', title: 'To pack', hint: 'Confirmed, not packed yet', count: null, more: false },
    { status: 'Packed', title: 'To ship', hint: 'Packed, waiting for the courier', count: null, more: false },
  ]);
  readonly latest = signal<AdminOrderSummary[]>([]);
  readonly report = signal<ReportSummary | null>(null);
  readonly failed = signal(false);

  constructor() {
    inject(Title).setTitle(`Dashboard | ${BRAND.name} Admin`);

    for (const q of this.queues()) {
      this.orders.list(1, PAGE, { status: q.status }).pipe(catchError(() => of(null))).subscribe(res => {
        if (!res) {
          this.failed.set(true);
          return;
        }
        this.queues.update(list => list.map(item => item.status === q.status
          ? { ...item, count: res.items.length, more: res.items.length >= PAGE }
          : item));
        if (q.status === 'Pending') this.latest.set(res.items.slice(0, 5));
      });
    }

    if (this.auth.isAdmin()) {
      this.reports.summary().pipe(catchError(() => of(null))).subscribe(r => this.report.set(r));
    }
  }
}