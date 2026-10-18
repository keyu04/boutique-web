import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators,
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BRAND, CategoriesApi, apiMessage } from '@shared';
import { AdminImage, AdminProduct, CreateProductRequest } from '../../core/admin-models';
import { AdminProductsApi } from '../../core/admin-products.api';
import { MAX_IMAGES, checkImageFiles } from '../../core/image-rules';
import { ImageManager } from './image-manager';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;

type LoadState = 'loading' | 'ready' | 'notfound' | 'error';
interface PendingPhoto { file: File; url: string; }

function mrpNotBelowPrice(group: AbstractControl): ValidationErrors | null {
  const price = group.get('price')?.value;
  const mrp = group.get('mrp')?.value;
  return price != null && mrp != null && mrp < price ? { mrpBelowPrice: true } : null;
}

@Component({
  selector: 'app-product-form',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink, ImageManager],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductFormPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(AdminProductsApi);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // /products/new has no :id (create mode). /products/:id is edit mode.
  private readonly rawId = inject(ActivatedRoute).snapshot.paramMap.get('id');
  readonly isEdit = this.rawId !== null;
  private readonly productId = this.isEdit ? Number(this.rawId) : null;

  readonly sizes = SIZES;
  readonly maxImages = MAX_IMAGES;
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

  readonly loadState = signal<LoadState>(this.isEdit ? 'loading' : 'ready');
  readonly product = signal<AdminProduct | null>(null);
  readonly images = signal<AdminImage[]>([]);
  readonly isActive = signal(true);
  readonly toggling = signal(false);
  readonly toggleError = signal<string | null>(null);
  readonly notice = signal<string | null>(null);

  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly saved = signal(false);
  readonly submitError = signal<string | null>(null);

  // Photos picked on the create page, uploaded right after the product is created
  readonly pending = signal<PendingPhoto[]>([]);
  readonly photoProblems = signal<string[]>([]);

  private readonly values = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  readonly margin = computed(() => {
    const v = this.values();
    if (!v.price || v.costPrice == null) return null;
    const amount = v.price - v.costPrice;
    return { amount, percent: Math.round((amount / v.price) * 100) };
  });

  constructor() {
    inject(Title).setTitle(`${this.isEdit ? 'Edit product' : 'New product'} | ${BRAND.name} Admin`);
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.saved.set(false));
    this.destroyRef.onDestroy(() => this.pending().forEach(p => URL.revokeObjectURL(p.url)));

    if (this.isEdit) {
      const passed = history.state?.notice;
      if (typeof passed === 'string') this.notice.set(passed);

      const id = this.productId;
      if (id === null || !Number.isInteger(id) || id < 1) {
        this.loadState.set('notfound');
        return;
      }
      this.api.get(id).pipe(takeUntilDestroyed()).subscribe({
        next: product => this.populate(product),
        error: (e: HttpErrorResponse) => this.loadState.set(e.status === 404 ? 'notfound' : 'error'),
      });
    }
  }

  private qty() {
    return this.fb.control(0, [
      Validators.required, Validators.min(0), Validators.max(10000), Validators.pattern(/^\d+$/),
    ]);
  }

  private populate(p: AdminProduct): void {
    const stock = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
    for (const v of p.variants) {
      if (v.size in stock) stock[v.size as keyof typeof stock] = v.stockQuantity;
    }
    this.form.patchValue({
      name: p.name, categoryId: p.categoryId, color: p.color, fabric: p.fabric, tag: p.tag ?? '',
      price: p.price, mrp: p.mrp, costPrice: p.costPrice, weightKg: p.weightKg, stock,
    });
    this.product.set(p);
    this.images.set(p.images);
    this.isActive.set(p.isActive);
    this.loadState.set('ready');
  }

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

  private buildRequest(): CreateProductRequest {
    const v = this.form.getRawValue();
    const stock: Record<string, number> = {};
    for (const size of SIZES) stock[size] = Number(v.stock[size]); // always send all five sizes
    return {
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
    };
  }

  submit(): void {
    if (this.submitting()) return;
    this.submitted.set(true);
    this.submitError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    if (this.isEdit) this.update(); else this.create();
  }

  private update(): void {
    this.api.update(this.productId!, this.buildRequest()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.saved.set(true);
        this.form.markAsPristine();
      },
      error: (e: HttpErrorResponse) => {
        this.submitting.set(false);
        this.submitError.set(apiMessage(e));
      },
    });
  }

  private create(): void {
    this.api.create(this.buildRequest()).subscribe({
      next: created => this.uploadThenOpen(created.id),
      error: (e: HttpErrorResponse) => {
        this.submitting.set(false);
        this.submitError.set(apiMessage(e));
      },
    });
  }

  /** The product exists now. Upload any chosen photos, then open its edit page. */
  private uploadThenOpen(id: number): void {
    const files = this.pending().map(p => p.file);
    if (files.length === 0) {
      this.open(id, 'Product created. Add some photos below so it looks good in the store.');
      return;
    }
    this.api.uploadImages(id, files).subscribe({
      next: () => this.open(id, 'Product created with its photos.'),
      error: (e: HttpErrorResponse) =>
        this.open(id, `Product created, but the photos could not be uploaded: ${apiMessage(e)} You can add them below.`),
    });
  }

  private open(id: number, notice: string): void {
    this.router.navigate(['/products', id], { state: { notice } });
  }

  // ---- create mode: photos chosen before the product exists ----
  addPending(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    const { ok, problems } = checkImageFiles(files, this.pending().length);
    this.photoProblems.set(problems);
    this.pending.update(list => [...list, ...ok.map(file => ({ file, url: URL.createObjectURL(file) }))]);
  }

  removePending(photo: PendingPhoto): void {
    URL.revokeObjectURL(photo.url);
    this.pending.update(list => list.filter(p => p !== photo));
  }

  // ---- edit mode ----
  toggleActive(): void {
    const p = this.product();
    if (!p || this.toggling()) return;
    this.toggling.set(true);
    this.toggleError.set(null);
    this.api.setActive(p.id, !this.isActive()).subscribe({
      next: () => {
        this.isActive.update(v => !v);
        this.toggling.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.toggling.set(false);
        this.toggleError.set(apiMessage(e));
      },
    });
  }

  reloadImages(): void {
    const p = this.product();
    if (!p) return;
    this.api.get(p.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(fresh => this.images.set(fresh.images));
  }
}