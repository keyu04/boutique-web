import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { BRAND } from '@shared';
import { BagLine, BagService } from '../../core/bag.service';
import { SiteHeader } from '../../core/site-header';

@Component({
  selector: 'app-bag',
  imports: [CurrencyPipe, RouterLink, SiteHeader],
  templateUrl: './bag.html',
  styleUrl: './bag.scss',
})
export class BagPage {
  readonly bag = inject(BagService);

  constructor() {
    inject(Title).setTitle(`Your bag | ${BRAND.name}`);
  }

  change(line: BagLine, delta: number): void {
    this.bag.setQuantity(line.variantId, line.quantity + delta);
  }
}