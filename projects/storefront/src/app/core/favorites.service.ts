import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'sahjish.favorites.v1';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly _productIds = signal<number[]>(this.load());

  readonly productIds = this._productIds.asReadonly();

  isFavorite(productId: number): boolean {
    return this.productIds().includes(productId);
  }

  toggle(productId: number): void {
    const ids = this.productIds();
    const updated = ids.includes(productId)
      ? ids.filter(id => id !== productId)
      : [...ids, productId];

    this._productIds.set(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch { /* private mode or blocked storage: favorites still work in memory */ }
  }

  private load(): number[] {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      return Array.isArray(parsed) ? parsed.filter(Number.isInteger) : [];
    } catch {
      return [];
    }
  }
}
