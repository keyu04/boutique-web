import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators,
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { BRAND, CategoriesApi, apiMessage } from '@shared';
import { AdminProductsApi } from '../../core/admin-products.api';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;

function mrpNotBelowPrice(group: AbstractControl): ValidationErrors | null {
  const price = group.get('price')?.value;
  const mrp = group.get('mrp')?.value;
  return price != null && mrp != null && mrp < price ? { mrpBelowPrice: true } : null;
}

@Component({
  selector: 'app-product-form',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductFormPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(AdminProductsApi);
  private readonly router = inject(Router);

  readonly sizes = SIZES;
  readonly categories = toSignal(inject(CategoriesApi).list(), { initialValue: [] });

  readonly form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.maxLength(120)]],
      categoryId: this.fb.control<number | null>(null, Validators.required),
      color: ['', [Validators.required, Validators.maxLength(40)]],
      fabric: ['', [Validators.required, Validators.maxLength(40)]],
      tag: ['', [Validators.maxLength(30)]],
      price: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
      mrp: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
      costPrice: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
      weightKg: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01), Validators.max(50)]),
      stock: this.fb.group({
        S: this.qty(), M: this.qty(), L: this.qty(), XL: this.qty(), XXL: this.qty(),
      }),
    },
    { validators: [mrpNotBelowPrice] },
  );

  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly submitError = signal<string | null>(null);

  private readonly values = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  readonly margin = computed(() => {
    const v = this.values();
    if (!v.price || v.costPrice == null) return null;
    const amount = v.price - v.costPrice;
    return { amount, percent: Math.round((amount / v.price) * 100) };
  });

  constructor() {
    inject(Title).setTitle(`New product | ${BRAND.name} Admin`);
  }

  private qty() {
    return this.fb.control(0, [
      Validators.required, Validators.min(0), Validators.max(10000), Validators.pattern(/^\d+$/),
    ]);
  }

  /** Message for a field, shown once it has been touched or the user tried to submit. */
  err(path: string): string | null {
    const control = this.form.get(path);
    if (!control || !control.invalid || !(control.touched || this.submitted())) return null;
    const e = control.errors ?? {};
    if (e['required']) return 'This field is required.';
    if (e['min']) return `Must be at least ${e['min'].min}.`;
    if (e['max']) return `Must be at most ${e['max'].max}.`;
    if (e['maxlength']) return `Keep it under ${e['maxlength'].requiredLength} characters.`;
    if (e['pattern']) return 'Enter a whole number.';
    return 'Invalid value.';
  }

  mrpTooLow(): boolean {
    return !!this.form.errors?.['mrpBelowPrice'] && (this.form.controls.mrp.touched || this.submitted());
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
    const stock: Record<string, number> = {};
    for (const size of SIZES) {
      const quantity = Number(v.stock[size]);
      if (quantity > 0) stock[size] = quantity; // sizes left at 0 are simply not sent
    }

    this.submitting.set(true);
    this.api.create({
      name: v.name.trim(),
      categoryId: v.categoryId!,
      color: v.color.trim(),
      fabric: v.fabric.trim(),
      price: v.price!,
      mrp: v.mrp!,
      costPrice: v.costPrice!,
      weightKg: v.weightKg!,
      tag: v.tag.trim() || null,
      stock,
    }).subscribe({
      next: () => this.router.navigateByUrl('/products'),
      error: (e: HttpErrorResponse) => {
        this.submitting.set(false);
        this.submitError.set(apiMessage(e));
      },
    });
  }
}