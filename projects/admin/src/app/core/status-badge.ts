import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  template: `<span class="badge" [attr.data-status]="status()">{{ status() }}</span>`,
  styles: `
    .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600;
      border: 1px solid var(--burgundy); color: var(--burgundy); background: transparent; }
    .badge[data-status='Confirmed'], .badge[data-status='Packed'], .badge[data-status='Shipped'] { background: var(--blush); }
    .badge[data-status='Delivered'] { background: var(--burgundy); color: #fff; }
    .badge[data-status='Cancelled'] { color: var(--muted); border-color: var(--muted); border-style: dashed; }
  `,
})
export class StatusBadge {
  readonly status = input.required<string>();
}