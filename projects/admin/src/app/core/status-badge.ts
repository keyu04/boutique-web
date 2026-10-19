import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  template: `
    <span class="badge" [attr.data-status]="status()">
      @if (status() === 'Delivered' || status() === 'Confirmed' || status() === 'Packed' || status() === 'Shipped') {
        <svg viewBox="0 0 14 14" aria-hidden="true"><path d="m2.5 7.2 2.7 2.6 6.3-6.1" /></svg>
      } @else if (status() === 'Pending') {
        <svg viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5" /><path d="M7 4v3l2 1.3" /></svg>
      }
      {{ status() }}
    </span>
  `,
  styles: `
    .badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 999px; background: #edf0e8; color: #52745e; font-size: 0.68rem; font-weight: 600; white-space: nowrap; }
    .badge svg { width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.5; }
    .badge[data-status='Pending'] { background: #fff0d9; color: #9b621f; }
    .badge[data-status='Confirmed'], .badge[data-status='Packed'], .badge[data-status='Shipped'] { background: #e8eef3; color: #526d83; }
    .badge[data-status='Cancelled'] { background: #f2e8e7; color: #8a5856; }
  `,
})
export class StatusBadge {
  readonly status = input.required<string>();
}