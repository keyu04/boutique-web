import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
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
    <header class="welcome">
      <div>
        <h1>Welcome back, {{ auth.displayName() }}</h1>
        <p class="muted">Here is what needs doing today.</p>
      </div>
      <p class="today">
        <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="5" width="14" height="12" rx="1.5" /><path d="M6.5 3v4M13.5 3v4M3 9h14" /></svg>
        {{ today | date: 'EEEE, d MMMM y' }}
      </p>
    </header>

    @if (failed()) {
      <p class="err" role="alert">Some numbers could not be loaded. Refresh the page to try again.</p>
    }

    <section aria-labelledby="todo">
      <div class="section-title">
        <h2 id="todo">Orders to work on</h2>
        @if (pendingCount() > 0) {
          <span class="attention">{{ pendingCount() }} {{ pendingCount() === 1 ? 'order needs' : 'orders need' }} your attention</span>
        }
      </div>
      <div class="queues">
        @for (q of queues(); track q.status) {
          <a class="tile queue" [class.primary]="q.status === 'Pending'" routerLink="/orders" [queryParams]="{ status: q.status }">
            <span class="queue-top">
            <span class="label">{{ q.title }}</span>
              @if (q.status === 'Pending') {
                <svg class="queue-icon" viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="3" width="12" height="14" rx="1.5" /><path d="M7 3.5h6M7 8h6M7 11h4" /><path d="m12 14 1.3 1.3L16 12.5" /></svg>
              } @else if (q.status === 'Confirmed') {
                <svg class="queue-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="m10 2.5 7 4v7l-7 4-7-4v-7zM3.5 6.8 10 10.5l6.5-3.7M10 10.5v7" /></svg>
              } @else {
                <svg class="queue-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M2.5 5h9v9h-9zM11.5 8h3.3l2.7 3v3h-6z" /><circle cx="6" cy="15.5" r="1.5" /><circle cx="14.5" cy="15.5" r="1.5" /></svg>
              }
            </span>
            <span class="count-row">
            <span class="value">{{ q.count === null ? '–' : q.count }}{{ q.more ? '+' : '' }}</span>
              @if (q.status === 'Pending') {
                <span class="review">Review orders <span aria-hidden="true">→</span></span>
              }
            </span>
            <span class="sub">{{ q.hint }}</span>
          </a>
        }
      </div>
    </section>

    <section class="latest-card" aria-labelledby="latest">
      <header class="latest-heading">
        <div>
          <h2 id="latest">Newest orders waiting to be confirmed</h2>
          <p>Review your latest orders, newest first.</p>
        </div>
        <a class="pending-link" routerLink="/orders" [queryParams]="{ status: 'Pending' }">
          To confirm@if (pendingCount() > 0) { · {{ pendingCount() }} }
        </a>
      </header>
      @if (latest().length > 0) {
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Order number</th><th scope="col">Customer / Location</th>
                <th scope="col">Placed at</th><th scope="col" class="amount">Amount</th><th scope="col"><span class="visually-hidden">Open order</span></th>
              </tr>
            </thead>
            <tbody>
          @for (o of latest(); track o.id) {
                <tr>
                  <td><a class="order-number" [routerLink]="['/orders', o.id]">{{ o.orderNumber }}</a></td>
                  <td>{{ o.customerName }}, {{ o.city }}</td>
                  <td class="placed">{{ o.createdAt | date: 'd MMM, h:mm a' }}</td>
                  <td class="amount">{{ o.total | currency: 'INR' : 'symbol' : '1.0-0' }}</td>
                  <td><a class="open-order" [routerLink]="['/orders', o.id]" [attr.aria-label]="'Open order ' + o.orderNumber">↗</a></td>
                </tr>
          }
            </tbody>
          </table>
        </div>
      } @else {
        <p class="empty">No orders are waiting to be confirmed.</p>
      }
    </section>

    @if (auth.isAdmin() && report(); as r) {
      <section class="report-section" aria-labelledby="month">
        <header class="report-heading">
          <h2 id="month">Last 30 days</h2>
          <span>{{ r.from }} to {{ r.to }}</span>
          <a routerLink="/reports">Open full report <span aria-hidden="true">→</span></a>
        </header>
        <div class="metrics">
          <div class="metric"><span class="label">Orders</span><strong>{{ r.orderCount }}</strong><small>Orders in this period</small></div>
          <div class="metric"><span class="label">Item revenue</span><strong>{{ r.itemRevenue | currency: 'INR' : 'symbol' : '1.0-0' }}</strong><small>Item revenue in this period</small></div>
          <div class="metric"><span class="label">Margin</span><strong>{{ r.margin | currency: 'INR' : 'symbol' : '1.0-0' }}</strong><small>{{ r.marginPercent | number: '1.0-1' }}% of item revenue</small></div>
          </div>
      </section>
    }
  `,
  styles: `
    :host { display: block; }
    .welcome { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 27px; }
    h1 { margin: 0; color: var(--burgundy); font-family: var(--font-display); font-size: clamp(2.2rem, 3vw, 2.7rem); font-weight: 500; line-height: 1.2; }
    h2 { margin: 0; color: #423436; font-size: 0.95rem; font-weight: 700; }
    .muted, .today, .latest-heading p, .placed, .report-heading > span, .metric small { color: #93827b; }
    .muted { margin: 6px 0 0; font-size: 0.9rem; }
    .today { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 0.8rem; }
    .today svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.4; }
    .err { margin: 14px 0; padding: 12px 15px; border: 1px solid #dfc8c2; border-radius: 5px; background: #fffdfa; color: #8c302d; font-size: 0.9rem; }
    .section-title { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .attention { color: var(--muted); font-size: 0.78rem; }
    .queues { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 15px; }
    .tile { min-width: 0; }
    .queue { display: flex; min-height: 146px; flex-direction: column; gap: 8px; padding: 17px 19px; border: 1px solid #e9ddd4; border-radius: 8px; background: #fffdfa; color: #3e3434; text-decoration: none; }
    .queue.primary { border-color: #68263a; background: #68263a; color: #fff; }
    .queue:hover { border-color: var(--burgundy); }
    .queue:focus-visible, a:focus-visible { outline: 2px solid #a05a6e; outline-offset: 2px; }
    .queue-top, .count-row { display: flex; align-items: center; justify-content: space-between; }
    .queue-top { min-height: 20px; }
    .label { color: #917e77; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
    .queue-icon { width: 19px; height: 19px; fill: none; stroke: var(--burgundy); stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.3; }
    .primary .label, .primary .queue-icon { color: #e7d5d8; stroke: #e7d5d8; }
    .value { font-size: 2.1rem; font-weight: 500; line-height: 1.1; }
    .count-row { justify-content: flex-start; gap: 16px; }
    .review { display: flex; align-items: center; gap: 6px; margin-left: auto; color: #f4e8e8; font-size: 0.75rem; }
    .sub { color: #93827b; font-size: 0.8rem; }
    .primary .sub { color: #ddc3c9; }
    .latest-card { margin-top: 25px; overflow: hidden; border: 1px solid #e9ddd4; border-radius: 8px; background: #fffdfa; }
    .latest-heading { display: flex; min-height: 78px; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 20px; }
    .latest-heading h2 { font-family: var(--font-display); font-size: 1.4rem; font-weight: 500; }
    .latest-heading p { margin: 5px 0 0; font-size: 0.78rem; }
    .pending-link { min-width: 138px; padding: 10px 13px; border-radius: 6px; background: #f1e5e4; color: var(--burgundy); font-size: 0.78rem; text-align: center; text-decoration: none; white-space: nowrap; }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { padding: 12px 20px; background: #f3ede5; color: #89786f; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; white-space: nowrap; }
    td { padding: 14px 20px; border-bottom: 1px solid #e9ddd4; color: #463a38; font-size: 0.8rem; white-space: nowrap; }
    tbody tr:last-child td { border-bottom: 0; }
    .order-number { color: #7e3348; font-weight: 700; text-decoration: none; }
    .amount { text-align: right; font-weight: 700; }
    .placed { font-size: 0.76rem; }
    .open-order { display: grid; width: 28px; height: 28px; place-items: center; border-radius: 6px; background: #f4eee7; color: var(--burgundy); font-size: 0.95rem; text-decoration: none; }
    .empty { margin: 0; padding: 22px; color: var(--muted); font-size: 0.9rem; }
    .report-section { margin-top: 25px; }
    .report-heading { display: flex; align-items: center; gap: 15px; margin-bottom: 12px; }
    .report-heading h2 { font-size: 0.95rem; }
    .report-heading > span { font-size: 0.72rem; }
    .report-heading a { display: inline-flex; align-items: center; gap: 7px; margin-left: auto; color: var(--burgundy); font-size: 0.78rem; text-decoration: none; }
    .metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); padding: 16px 0; border: 1px solid #e9ddd4; border-radius: 8px; background: #fffdfa; }
    .metric { display: flex; min-width: 0; flex-direction: column; gap: 7px; padding: 0 20px; border-right: 1px solid #eee4db; }
    .metric:last-child { border-right: 0; }
    .metric .label { font-size: 0.65rem; }
    .metric strong { color: #453a39; font-size: 1.75rem; font-weight: 500; line-height: 1.15; }
    .metric small { font-size: 0.74rem; }
    .visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
    @media (max-width: 620px) {
      .welcome { align-items: flex-start; flex-direction: column; gap: 8px; }
      h1 { font-size: 2rem; }
      .queues { grid-template-columns: 1fr; gap: 8px; }
      .queue { min-height: 120px; }
      .latest-heading { align-items: flex-start; }
      .latest-heading h2 { font-size: 1.15rem; }
      table { min-width: 700px; }
      .report-heading { flex-wrap: wrap; }
      .report-heading a { margin-left: auto; }
      .metrics { grid-template-columns: 1fr; }
      .metric { padding: 10px 14px; border-right: 0; border-bottom: 1px solid #eee4db; }
      .metric:last-child { border-bottom: 0; }
    }
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
  readonly today = new Date();
  readonly pendingCount = computed(() => this.queues().find(q => q.status === 'Pending')?.count ?? 0);

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