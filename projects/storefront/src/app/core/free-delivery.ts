import { CurrencyPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ShippingEstimate } from '@shared';

@Component({
  selector: 'app-free-delivery',
  imports: [CurrencyPipe],
  template: `
    @if (estimate().amountToFreeDelivery > 0 && estimate().freeDeliveryAtSubtotal) {
      <div class="free-delivery">
        <p>Add <strong>{{ estimate().amountToFreeDelivery | currency: 'INR' : 'symbol' : '1.0-0' }}</strong>
           more to get <strong>free delivery</strong></p>
        <div class="bar" role="progressbar" aria-label="Progress to free delivery"
             aria-valuemin="0" aria-valuemax="100" [attr.aria-valuenow]="progress()">
          <span [style.width.%]="progress()"></span>
        </div>
      </div>
    } @else if (estimate().charge === 0) {
      <p class="unlocked">✓ You’ve unlocked free delivery</p>
    }
  `,
  styles: `
    .free-delivery { margin: 0.75rem 0; font-size: 0.875rem; }
    .free-delivery p { margin: 0 0 0.5rem; }
    .bar { height: 6px; border-radius: 3px; background: rgba(0, 0, 0, 0.1); overflow: hidden; }
    .bar span { display: block; height: 100%; background: #2e7d32; transition: width 0.3s ease; }
    .unlocked { margin: 0.75rem 0; font-size: 0.875rem; color: #2e7d32; font-weight: 600; }
  `,
})
export class FreeDelivery {
  readonly estimate = input.required<ShippingEstimate>();
  readonly subtotal = input.required<number>();

  readonly progress = computed(() => {
    const target = this.estimate().freeDeliveryAtSubtotal;
    if (!target) return 0;
    return Math.min(100, Math.round((this.subtotal() / target) * 100));
  });
}
