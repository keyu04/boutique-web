import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderResult } from '@shared';
import { formatPageTitle } from '../../core/page-title';
import { SiteHeader } from '../../core/site-header';
import { SiteFooter } from '../../core/site-footer';

@Component({
  selector: 'app-order-confirmation',
  imports: [CurrencyPipe, RouterLink, SiteHeader, SiteFooter],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.scss',
})
export class OrderConfirmationPage {
  readonly orderNumber = inject(ActivatedRoute).snapshot.paramMap.get('orderNumber') ?? '';
  readonly order: OrderResult | null;

  constructor() {
    inject(Title).setTitle(formatPageTitle('Order placed'));
    const passed = history.state?.order as OrderResult | undefined;
    this.order = passed && passed.orderNumber === this.orderNumber ? passed : null;
  }
}