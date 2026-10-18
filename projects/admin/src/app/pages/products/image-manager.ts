import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { apiMessage } from '@shared';
import { Observable } from 'rxjs';
import { AdminImage } from '../../core/admin-models';
import { AdminProductsApi } from '../../core/admin-products.api';
import { MAX_IMAGES, checkImageFiles } from '../../core/image-rules';

@Component({
  selector: 'app-image-manager',
  template: `
    <div class="head">
      <h2>Photos <small>({{ images().length }} of {{ max }})</small></h2>
      <button type="button" class="btn btn-ghost btn-small"
              [disabled]="busy() || images().length >= max" (click)="picker.click()">
        {{ busy() ? 'Working…' : 'Add photos' }}
      </button>
      <input #picker type="file" class="sr" multiple accept="image/jpeg,image/png,image/webp"
             (change)="onPick($event)" />
    </div>

    @for (p of problems(); track p) { <p class="err">{{ p }}</p> }
    @if (error(); as e) { <p class="err" role="alert">{{ e }}</p> }

    @if (ordered().length === 0) {
      <p class="muted">No photos yet. Add a few so the product looks good in the store.</p>
    }

    <ul class="grid">
      @for (img of ordered(); track img.id; let i = $index) {
        <li class="item">
          <img [src]="img.url" [alt]="'Photo ' + (i + 1)" />
          @if (img.isPrimary) { <span class="badge">Main photo</span> }
          <div class="tools">
            <button type="button" class="mini" aria-label="Move earlier"
                    [disabled]="busy() || i === 0" (click)="move(i, -1)">←</button>
            <button type="button" class="mini" aria-label="Move later"
                    [disabled]="busy() || i === ordered().length - 1" (click)="move(i, 1)">→</button>
            @if (!img.isPrimary) {
              <button type="button" class="mini" [disabled]="busy()" (click)="makePrimary(img)">Make main</button>
            }
            <button type="button" class="mini danger" [disabled]="busy()" (click)="remove(img)">Delete</button>
          </div>
        </li>
      }
    </ul>
  `,
  styles: `
    .head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    h2 { margin: 0; font-family: var(--font-display); font-weight: 500; font-size: 1.4rem; }
    h2 small { font-family: var(--font-body); font-size: 0.85rem; color: var(--muted); }
    .muted { color: var(--muted); }
    .grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 16px; }
    .item { position: relative; border: 1px solid var(--blush); border-radius: 10px; overflow: hidden; background: #fff; }
    .item img { display: block; width: 100%; aspect-ratio: 4 / 5; object-fit: cover; }
    .badge { position: absolute; top: 8px; left: 8px; background: var(--burgundy); color: #fff; font-size: 0.75rem; font-weight: 600; padding: 3px 10px; border-radius: 999px; }
    .tools { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px; }
    .mini { height: 32px; min-width: 32px; padding: 0 10px; border: 1px solid var(--burgundy); border-radius: 999px; background: #fff; color: var(--burgundy); font: inherit; font-size: 0.8rem; cursor: pointer; }
    .mini:hover:not(:disabled) { background: var(--blush); }
    .mini:disabled { opacity: 0.4; cursor: not-allowed; }
    .mini.danger { border-style: dashed; }
    .mini:focus-visible, .btn:focus-visible { outline: 3px solid var(--burgundy); outline-offset: 2px; }
    .err { margin: 8px 0 0; font-size: 0.85rem; font-weight: 600; }
    .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  `,
})
export class ImageManager {
  readonly productId = input.required<number>();
  readonly images = input.required<AdminImage[]>();
  readonly changed = output<void>();

  private readonly api = inject(AdminProductsApi);
  readonly max = MAX_IMAGES;
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly problems = signal<string[]>([]);

  readonly ordered = computed(() => [...this.images()].sort((a, b) => a.sortOrder - b.sortOrder));

  onPick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = ''; // lets the same file be picked again later
    if (files.length === 0) return;

    const { ok, problems } = checkImageFiles(files, this.images().length);
    this.problems.set(problems);
    if (ok.length > 0) this.run(this.api.uploadImages(this.productId(), ok));
  }

  makePrimary(image: AdminImage): void {
    this.run(this.api.setPrimary(this.productId(), image.id));
  }

  remove(image: AdminImage): void {
    if (!confirm('Delete this photo? This cannot be undone.')) return;
    this.run(this.api.deleteImage(this.productId(), image.id));
  }

  move(index: number, delta: -1 | 1): void {
    const ids = this.ordered().map(i => i.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    this.run(this.api.reorderImages(this.productId(), ids));
  }

  private run(operation: Observable<unknown>): void {
    this.busy.set(true);
    this.error.set(null);
    operation.subscribe({
      next: () => {
        this.busy.set(false);
        this.problems.set([]);
        this.changed.emit(); // the parent reloads the photo list
      },
      error: (e: HttpErrorResponse) => {
        this.busy.set(false);
        this.error.set(apiMessage(e));
      },
    });
  }
}