import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProductListReturnState {
  private productSlug: string | null = null;
  private scrollPosition: number | null = null;

  remember(productSlug: string): void {
    this.productSlug = productSlug;
  }

  rememberScrollPosition(scrollPosition: number): void {
    this.scrollPosition = scrollPosition;
  }

  consume(): string | null {
    const productSlug = this.productSlug;
    this.productSlug = null;
    return productSlug;
  }

  consumeScrollPosition(): number | null {
    const scrollPosition = this.scrollPosition;
    this.scrollPosition = null;
    return scrollPosition;
  }
}
