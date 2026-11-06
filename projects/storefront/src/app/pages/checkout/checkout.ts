import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { EMPTY, catchError, distinctUntilChanged, finalize, map, switchMap, tap } from 'rxjs';
import { BRAND, OrdersApi, ShippingApi, ShippingEstimate } from '@shared';
import { apiMessage } from '../../core/api-error';
import { BagService } from '../../core/bag.service';
import { SiteHeader } from '../../core/site-header';
import { SiteFooter } from '../../core/site-footer';

const PINCODE = /^[1-9]\d{5}$/;
const PHONE = /^[6-9]\d{9}$/;

type Field = 'customerName' | 'phone' | 'addressLine' | 'city' | 'state' | 'pincode';

const ERRORS: Record<Field, string> = {
  customerName: 'Please enter your full name.',
  phone: 'Enter a valid 10-digit mobile number.',
  addressLine: 'Please enter your address.',
  city: 'Please enter your city.',
  state: 'Please choose your state.',
  pincode: 'Enter a valid 6-digit pincode.',
};

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

@Component({
  selector: 'app-checkout',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink, SiteHeader, SiteFooter],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class CheckoutPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly shippingApi = inject(ShippingApi);
  private readonly ordersApi = inject(OrdersApi);
  readonly bag = inject(BagService);

  readonly states = INDIAN_STATES;
  readonly errors = ERRORS;

  readonly form = this.fb.group({
    customerName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.pattern(PHONE)]],
    addressLine: ['', [Validators.required, Validators.maxLength(200)]],
    city: ['', [Validators.required, Validators.maxLength(80)]],
    state: ['', [Validators.required]],
    pincode: ['', [Validators.required, Validators.pattern(PINCODE)]],
  });

  readonly shipping = signal<ShippingEstimate | null>(null);
  readonly shippingError = signal<string | null>(null);
  readonly estimating = signal(false);
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly submitted = signal(false);
  readonly done = signal(false);

  readonly total = computed(() => this.bag.subtotal() + (this.shipping()?.charge ?? 0));

  constructor() {
    inject(Title).setTitle(`Checkout | ${BRAND.name}`);

    // Whenever the pincode changes: drop the old estimate, and fetch a new one once it is valid.
    // switchMap cancels an in-flight request if the customer keeps typing.
    this.form.controls.pincode.valueChanges.pipe(
      map(value => value.trim()),
      distinctUntilChanged(),
      tap(() => {
        this.shipping.set(null);
        this.shippingError.set(null);
      }),
      switchMap(pincode => {
        if (!PINCODE.test(pincode)) return EMPTY;
        this.estimating.set(true);
        return this.shippingApi.estimate({
          pincode,
          paymentMethod: 'Cod',
          items: this.bag.lines().map(l => ({ variantId: l.variantId, quantity: l.quantity })),
        }).pipe(
          catchError((e: HttpErrorResponse) => {
            this.shippingError.set(apiMessage(e, 'Could not estimate shipping.'));
            return EMPTY;
          }),
          finalize(() => this.estimating.set(false)),
        );
      }),
      takeUntilDestroyed(),
    ).subscribe(estimate => this.shipping.set(estimate));

    const checkedPincode = history.state?.checkedPincode;
    if (typeof checkedPincode === 'string' && PINCODE.test(checkedPincode)) {
      this.form.controls.pincode.setValue(checkedPincode);
    }
  }

  invalid(field: Field): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }

  submit(): void {
    if (this.submitting()) return;
    this.submitted.set(true);
    this.submitError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.submitting.set(true);
    this.ordersApi.create({
      items: this.bag.lines().map(l => ({ variantId: l.variantId, quantity: l.quantity })),
      customerName: v.customerName.trim(),
      phone: v.phone.trim(),
      addressLine: v.addressLine.trim(),
      city: v.city.trim(),
      state: v.state,
      pincode: v.pincode.trim(),
      paymentMethod: 'Cod',
    }).subscribe({
      next: order => {
        this.done.set(true); // stops the "bag is empty" screen flashing while we navigate
        this.bag.clear();
        this.router.navigate(['/order', order.orderNumber], { state: { order } });
      },
      error: (e: HttpErrorResponse) => {
        this.submitting.set(false);
        this.submitError.set(apiMessage(e));
      },
    });
  }
}