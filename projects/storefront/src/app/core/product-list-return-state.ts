import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProductListReturnState {
  private productSlug: string | null = null;

  remember(productSlug: string): void {
    this.productSlug = productSlug;
  }

  consume(): string | null {
    const productSlug = this.productSlug;
    this.productSlug = null;
    return productSlug;
  }
}
