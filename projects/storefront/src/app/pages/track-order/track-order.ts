import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TrackedOrder, TrackingApi, apiMessage } from '@shared';
import { formatPageTitle } from '../../core/page-title';
import { SiteHeader } from '../../core/site-header';
import { SiteFooter } from '../../core/site-footer';

const STEPS = [
  { status: 'Pending', label: 'Order placed' },
  { status: 'Confirmed', label: 'Confirmed' },
  { status: 'Packed', label: 'Packed' },
  { status: 'Shipped', label: 'Shipped' },
  { status: 'Delivered', label: 'Delivered' },
];

/** The server accepts +91 / 0 prefixes and keeps the last 10 digits, so allow 10 to 12 digits here. */
function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const digits = String(control.value ?? '').replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 12 ? null : { phone: true };
}

@Component({
  selector: 'app-track-order',
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, SiteHeader, SiteFooter],
  templateUrl: './track-order.html',
  styleUrl: './track-order.scss',
})
export class TrackOrderPage {
  private readonly api = inject(TrackingApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = inject(NonNullableFormBuilder).group({
    orderNumber: ['', [Validators.required, Validators.maxLength(40)]],
    phone: ['', [Validators.required, phoneValidator]],
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly order = signal<TrackedOrder | null>(null);
  readonly copied = signal(false);

  readonly steps = computed(() => {
    const o = this.order();
    if (!o) return [];
    const at = new Map(o.timeline.map(t => [t.status, t.at]));
    let current = -1;
    STEPS.forEach((s, i) => { if (at.has(s.status)) current = i; });
    return STEPS.map((s, i) => ({
      label: s.label,
      at: at.get(s.status) ?? null,
      state: i < current ? 'done' : i === current ? 'current' : 'todo',
    }));
  });

  readonly cancelledAt = computed(() => {
    const o = this.order();
    return o?.timeline.find(t => t.status === 'Cancelled')?.at ?? null;
  });

  readonly codDue = computed(() => {
    const o = this.order();
    return !!o && o.paymentMethod === 'Cod' && o.paymentStatus !== 'Paid' && o.status !== 'Cancelled';
  });

  constructor() {
    inject(Title).setTitle(formatPageTitle('Track your order'));
    const prefill = inject(ActivatedRoute).snapshot.queryParamMap.get('order');
    if (prefill) this.form.controls.orderNumber.setValue(prefill.slice(0, 40));
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;

    const { orderNumber, phone } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);
    this.order.set(null);

    this.api.track(orderNumber.trim(), phone.trim()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: order => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(
          e.status === 429
            ? 'Too many attempts. Please wait a minute and try again.'
            : apiMessage(e, 'We could not look up your order. Please try again.'),
        );
      },
    });
  }

  async copy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      // Clipboard can be blocked; the number is still visible to copy by hand.
    }
  }

  paymentLabel(method: string): string {
    return method === 'Cod' ? 'Cash on delivery' : 'Online payment via WhatsApp';
  }

  paymentStatusLabel(status: string): string {
    return status === 'CodDue' ? 'Due on delivery' : status;
  }
}
