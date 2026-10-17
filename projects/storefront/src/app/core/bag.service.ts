import { Injectable, computed, signal } from '@angular/core';

export interface BagLine {
  variantId: number;
  productId: number;
  slug: string;
  name: string;
  image: string | null;
  size: string;
  price: number;        // display only. The server re-prices at checkout.
  quantity: number;
  maxQuantity: number;  // min(stock, 10)
}

const STORAGE_KEY = 'sahjish.bag.v1';
const MAX_PER_LINE = 10; // same limits as CheckoutRules on the API
const MAX_LINES = 20;

@Injectable({ providedIn: 'root' })
export class BagService {
  private readonly _lines = signal<BagLine[]>(this.load());

  readonly lines = this._lines.asReadonly();
  readonly count = computed(() => this._lines().reduce((n, l) => n + l.quantity, 0));
  readonly subtotal = computed(() => this._lines().reduce((s, l) => s + l.price * l.quantity, 0));

  /** Returns an error message, or null when the item was added. */
  add(item: Omit<BagLine, 'quantity' | 'maxQuantity'>, stock: number, qty = 1): string | null {
    const maxQuantity = Math.min(stock, MAX_PER_LINE);
    const lines = this._lines();
    const existing = lines.find(l => l.variantId === item.variantId);

    if (existing) {
      if (existing.quantity + qty > maxQuantity) {
        return `Only ${maxQuantity} available in size ${item.size}.`;
      }
      this.set(lines.map(l =>
        l.variantId === item.variantId ? { ...l, quantity: l.quantity + qty, maxQuantity } : l));
      return null;
    }

    if (qty > maxQuantity) return `Only ${maxQuantity} available in size ${item.size}.`;
    if (lines.length >= MAX_LINES) return 'Your bag is full.';
    this.set([...lines, { ...item, quantity: qty, maxQuantity }]);
    return null;
  }

  setQuantity(variantId: number, quantity: number): void {
    this.set(this._lines()
      .map(l => (l.variantId === variantId
        ? { ...l, quantity: Math.min(Math.max(quantity, 1), l.maxQuantity) }
        : l)));
  }

  remove(variantId: number): void {
    this.set(this._lines().filter(l => l.variantId !== variantId));
  }

  clear(): void {
    this.set([]);
  }

  private set(lines: BagLine[]): void {
    this._lines.set(lines);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch { /* private mode or blocked storage: the bag still works in memory */ }
  }

  private load(): BagLine[] {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(l =>
        l && Number.isInteger(l.variantId) && Number.isInteger(l.quantity) &&
        l.quantity >= 1 && typeof l.price === 'number');
    } catch {
      return [];
    }
  }
}