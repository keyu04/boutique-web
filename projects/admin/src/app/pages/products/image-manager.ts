import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { apiMessage } from '@shared';
import { Observable } from 'rxjs';
import { AdminImage } from '../../core/admin-models';
import { AdminProductsApi } from '../../core/admin-products.api';
import { MAX_IMAGES, prepareImageFiles } from '../../core/image-rules';

@Component({
  selector: 'app-image-manager',
  template: `
    <div class="head">
      <h2>Photos <small>({{ images().length }} of {{ max }})</small></h2>
      <button type="button" class="btn btn-ghost btn-small"
              [disabled]="busy() || processingPhotos() || images().length >= max" (click)="picker.click()">
        {{ processingPhotos() ? 'Optimizing…' : busy() ? 'Working…' : 'Add photos' }}
      </button>
      <input #picker type="file" class="sr" multiple accept="image/jpeg,image/png,image/webp"
             (change)="onPick($event)" />
    </div>

    <p class="upload-note">Images are fitted to 4:5 and converted to WebP before upload.</p>
    @for (p of problems(); track p) { <p class="err">{{ p }}</p> }
    @if (error(); as e) { <p class="err" role="alert">{{ e }}</p> }

    @if (ordered().length === 0) {
      <p class="muted">No photos yet. Add a few so the product looks good in the store.</p>
    } @else if (selected(); as image) {
      <div class="gallery">
        <div class="thumbnail-grid" aria-label="Product photo thumbnails">
          @for (img of ordered(); track img.id; let i = $index) {
            <button type="button" class="thumbnail" [class.selected]="image.id === img.id"
                    [class.dragging]="draggedImageId() === img.id" [class.drop-target]="dropTargetId() === img.id"
                    draggable="true"
                    [attr.aria-label]="'Show photo ' + (i + 1) + (img.isPrimary ? ', main photo' : '')"
                    [attr.aria-pressed]="image.id === img.id" (click)="select(img)"
                    (dragstart)="startDrag($event, img.id)" (dragover)="allowDrop($event, img.id)"
                    (drop)="drop($event, img.id)" (dragend)="endDrag()">
              <img [src]="img.url" [alt]="img.altText || ('Photo ' + (i + 1))" />
              @if (img.isPrimary) { <span class="main-dot" aria-label="Main photo">Main</span> }
            </button>
          }
        </div>

        <div class="preview">
          <div class="preview-image">
            <img [src]="image.url" [alt]="image.altText || 'Selected product photo'" />
            @if (image.isPrimary) { <span class="badge">Main photo</span> }
          </div>
          <div class="tools">
            <button type="button" class="icon-button" aria-label="Move photo earlier"
                    [disabled]="busy() || selectedIndex() === 0" (click)="move(selectedIndex(), -1)">←</button>
            <button type="button" class="icon-button" aria-label="Move photo later"
                    [disabled]="busy() || selectedIndex() === ordered().length - 1" (click)="move(selectedIndex(), 1)">→</button>
            @if (!image.isPrimary) {
              <button type="button" class="mini" [disabled]="busy()" (click)="makePrimary(image)">Make main</button>
            }
            <button type="button" class="mini danger" [disabled]="busy()" (click)="remove(image)">Delete</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 13px; }
    h2 { margin: 0; color: #413738; font-family: var(--font-display); font-weight: 500; font-size: 1.05rem; }
    h2 small { font-family: var(--font-body); font-size: 0.72rem; color: var(--muted); }
    .head .btn { height: 30px; padding: 0 10px; font-size: 0.68rem; }
    .muted, .upload-note { color: var(--muted); }
    .upload-note { margin: -5px 0 10px; font-size: 0.68rem; }
    .gallery { display: grid; gap: 10px; }
    .thumbnail-grid { display: grid; grid-auto-columns: 68px; grid-auto-flow: column; gap: 6px; overflow-x: auto; overflow-y: hidden; padding: 1px 1px 5px; scrollbar-width: thin; scrollbar-color: #cbb8b1 #f4eee8; }
    .thumbnail { position: relative; width: 68px; min-width: 68px; padding: 2px; border: 1px solid #e8ddd4; border-radius: 5px; background: #fffdfa; cursor: pointer; }
    .thumbnail[draggable="true"] { cursor: grab; }
    .thumbnail.dragging { opacity: 0.45; }
    .thumbnail.drop-target { border-color: var(--burgundy); }
    .thumbnail.selected { border: 2px solid var(--burgundy); padding: 1px; }
    .thumbnail img { display: block; width: 100%; aspect-ratio: 4 / 5; border-radius: 3px; background: #f0e8e1; object-fit: cover; }
    .main-dot { position: absolute; top: 5px; left: 5px; padding: 3px 5px; border-radius: 999px; background: var(--burgundy); color: #fff; font-size: 0.52rem; line-height: 1; }
    .preview { overflow: hidden; border: 1px solid #e8ddd4; border-radius: 6px; background: #fffdfa; }
    .preview-image { position: relative; }
    .preview-image > img { display: block; width: 100%; max-height: 360px; aspect-ratio: 4 / 5; background: #f0e8e1; object-fit: contain; }
    .badge { position: absolute; top: 8px; left: 8px; padding: 4px 8px; border-radius: 999px; background: var(--burgundy); color: #fff; font-size: 0.62rem; font-weight: 600; }
    .tools { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 7px; }
    .mini, .icon-button { display: inline-flex; min-height: 28px; align-items: center; justify-content: center; padding: 0 9px; border: 1px solid var(--burgundy); border-radius: 999px; background: #fff; color: var(--burgundy); font: inherit; font-size: 0.64rem; cursor: pointer; }
    .icon-button { width: 28px; padding: 0; font-size: 0.85rem; }
    .mini:hover:not(:disabled), .icon-button:hover:not(:disabled) { background: var(--blush); }
    .mini:disabled, .icon-button:disabled { opacity: 0.4; cursor: not-allowed; }
    .mini.danger { border-style: dashed; }
    .thumbnail:focus-visible, .mini:focus-visible, .icon-button:focus-visible, .btn:focus-visible { outline: 2px solid #9d5c70; outline-offset: 2px; }
    .err { margin: 8px 0 0; font-size: 0.75rem; font-weight: 600; }
    .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
    @media (max-width: 620px) { .preview-image > img { max-height: 460px; } }
  `,
})
export class ImageManager {
  readonly productId = input.required<number>();
  readonly images = input.required<AdminImage[]>();
  readonly changed = output<void>();

  private readonly api = inject(AdminProductsApi);
  readonly max = MAX_IMAGES;
  readonly busy = signal(false);
  readonly processingPhotos = signal(false);
  readonly error = signal<string | null>(null);
  readonly problems = signal<string[]>([]);

  readonly ordered = computed(() => [...this.images()].sort((a, b) => a.sortOrder - b.sortOrder));
  readonly selectedId = signal<number | null>(null);
  readonly draggedImageId = signal<number | null>(null);
  readonly dropTargetId = signal<number | null>(null);
  readonly selected = computed(() => {
    const images = this.ordered();
    return images.find(image => image.id === this.selectedId()) ??
      images.find(image => image.isPrimary) ?? images[0] ?? null;
  });
  readonly selectedIndex = computed(() => this.ordered().findIndex(image => image.id === this.selected()?.id));

  select(image: AdminImage): void {
    this.selectedId.set(image.id);
  }

  async onPick(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = ''; // lets the same file be picked again later
    if (files.length === 0) return;
    if (this.processingPhotos() || this.busy()) return;

    this.processingPhotos.set(true);
    this.problems.set([]);
    try {
      const { ok, problems } = await prepareImageFiles(files, this.images().length);
      this.problems.set(problems);
      if (ok.length > 0) this.run(this.api.uploadImages(this.productId(), ok));
    } finally {
      this.processingPhotos.set(false);
    }
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
    this.reorder(ids, index, target);
  }

  startDrag(event: DragEvent, imageId: number): void {
    if (this.busy()) {
      event.preventDefault();
      return;
    }
    this.draggedImageId.set(imageId);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(imageId));
    }
  }

  allowDrop(event: DragEvent, imageId: number): void {
    if (this.draggedImageId() === null || this.draggedImageId() === imageId) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.dropTargetId.set(imageId);
  }

  drop(event: DragEvent, targetImageId: number): void {
    event.preventDefault();
    event.stopPropagation();
    const draggedId = this.draggedImageId();
    this.endDrag();
    if (draggedId === null || draggedId === targetImageId || this.busy()) return;
    const ids = this.ordered().map(image => image.id);
    const fromIndex = ids.indexOf(draggedId);
    const targetIndex = ids.indexOf(targetImageId);
    if (fromIndex < 0 || targetIndex < 0) return;
    this.reorder(ids, fromIndex, targetIndex);
  }

  endDrag(): void {
    this.draggedImageId.set(null);
    this.dropTargetId.set(null);
  }

  private reorder(ids: number[], fromIndex: number, targetIndex: number): void {
    if (fromIndex === targetIndex) return;
    const [imageId] = ids.splice(fromIndex, 1);
    ids.splice(targetIndex, 0, imageId);
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