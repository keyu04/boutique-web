import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { BRAND, Page, apiMessage } from '@shared';
import { EMPTY, catchError, debounceTime, distinctUntilChanged, forkJoin, map, switchMap, tap } from 'rxjs';
import { AdminProduct } from '../../core/admin-models';
import { AdminProductsApi } from '../../core/admin-products.api';
import { AdminOrdersApi } from '../../core/admin-orders.api';
import { AdminOrder, AdminOrderSummary } from '../../core/order-models';
import { StatusBadge } from '../../core/status-badge';

const PAGE_SIZE = 20;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]!);
}

function formatRupees(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

@Component({
  selector: 'app-order-list',
  imports: [CurrencyPipe, DatePipe, RouterLink, StatusBadge],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss',
})
export class OrderListPage {
  private readonly api = inject(AdminOrdersApi);
  private readonly productsApi = inject(AdminProductsApi);
  private readonly router = inject(Router);
  readonly brand = BRAND;

  readonly statuses = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

  readonly searchText = signal('');
  readonly q = signal('');
  readonly status = signal(
    (() => {
      const s = inject(ActivatedRoute).snapshot.queryParamMap.get('status');
      return s && this.statuses.includes(s) ? s : '';
    })(),
  );
  readonly from = signal('');
  readonly to = signal('');
  readonly page = signal(1);
  private readonly reloadTick = signal(0);
  readonly data = signal<Page<AdminOrderSummary> | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly pdfError = signal<string | null>(null);
  readonly pdfLoadingId = signal<number | null>(null);

  readonly hasFilters = computed(() => !!(this.q() || this.status() || this.from() || this.to()));
  readonly statusTitle = computed(() => this.status() ? `${this.status()} orders` : 'All orders');
  readonly pendingPayments = computed(() =>
    this.data()?.items.filter(order => order.paymentStatus.toLowerCase() === 'pending').length ?? 0,
  );

  /** The orders API may not send a total, so treat it as optional. */
  readonly total = computed(() => {
    const t = (this.data() as { total?: unknown } | null)?.total;
    return typeof t === 'number' ? t : null;
  });

  readonly hasNext = computed(() => {
    const d = this.data();
    if (!d) return false;
    const total = this.total();
    return total !== null ? this.page() * PAGE_SIZE < total : d.items.length === PAGE_SIZE;
  });

  readonly showingFrom = computed(() => {
    const items = this.data()?.items ?? [];
    return items.length ? (this.page() - 1) * PAGE_SIZE + 1 : 0;
  });

  readonly showingTo = computed(() => {
    const items = this.data()?.items ?? [];
    const pageEnd = (this.page() - 1) * PAGE_SIZE + items.length;
    const total = this.total();
    return total === null ? pageEnd : Math.min(pageEnd, total);
  });

  readonly pageCount = computed(() => {
    const total = this.total();
    return total === null ? (this.hasNext() ? null : this.page()) : Math.max(1, Math.ceil(total / PAGE_SIZE));
  });

  constructor() {
    inject(Title).setTitle(`Orders | ${BRAND.name} Admin`);

    toObservable(this.searchText).pipe(
      debounceTime(300),
      map(text => text.trim()),
      distinctUntilChanged(),
      takeUntilDestroyed(),
    ).subscribe(text => {
      this.q.set(text);
      this.page.set(1);
    });

    const query = computed(() => ({
      page: this.page(), q: this.q(), status: this.status(),
      from: this.from(), to: this.to(), tick: this.reloadTick(),
    }));
    toObservable(query).pipe(
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap(({ page, q, status, from, to }) => this.api.list(page, PAGE_SIZE, { q, status, from, to }).pipe(
        catchError((e: HttpErrorResponse) => {
          this.error.set(apiMessage(e, 'Could not load orders.'));
          this.loading.set(false);
          return EMPTY;
        }),
      )),
      takeUntilDestroyed(),
    ).subscribe(result => {
      this.data.set(result);
      this.loading.set(false);
    });
  }

  setStatus(value: string): void { this.status.set(value); this.page.set(1); }
  setFrom(value: string): void { this.from.set(value); this.page.set(1); }
  setTo(value: string): void { this.to.set(value); this.page.set(1); }

  clearFilters(): void {
    this.searchText.set('');
    this.q.set('');
    this.status.set('');
    this.from.set('');
    this.to.set('');
    this.page.set(1);
  }

  go(delta: number): void {
    this.page.update(p => Math.max(p + delta, 1));
  }

  openOrderRow(event: Event, id: number): void {
    if (event.target instanceof Element && event.target.closest('a')) return;
    void this.router.navigate(['/orders', id]);
  }

  downloadThankYouCard(event: Event, order: AdminOrderSummary): void {
    event.stopPropagation();
    if (this.pdfLoadingId() !== null) return;
    this.pdfError.set(null);
    this.pdfLoadingId.set(order.id);
    void this.renderThankYouCard(this.createPdfFrame(), order);
  }

  downloadOrderSummary(event: Event, order: AdminOrderSummary): void {
    event.stopPropagation();
    if (this.pdfLoadingId() !== null) return;
    this.pdfError.set(null);
    this.pdfLoadingId.set(order.id);
    const pdfFrame = this.createPdfFrame();

    this.api.get(order.id).subscribe({
      next: details => {
        const productIds = [...new Set(details.items.map(item => item.productId))];
        if (productIds.length === 0) {
          void this.renderOrderSummary(pdfFrame, details, new Map());
          return;
        }
        forkJoin(productIds.map(id => this.productsApi.get(id))).subscribe({
          next: products => void this.renderOrderSummary(pdfFrame, details, new Map(products.map(product => [product.id, product]))),
          error: (e: HttpErrorResponse) => {
            this.pdfLoadingId.set(null);
            this.pdfError.set(apiMessage(e, `Could not load product details for order ${order.orderNumber}.`));
            pdfFrame.remove();
          },
        });
      },
      error: (e: HttpErrorResponse) => {
        this.pdfLoadingId.set(null);
        this.pdfError.set(apiMessage(e, `Could not load the details for order ${order.orderNumber}.`));
        pdfFrame.remove();
      },
    });
  }

  private async renderOrderSummary(pdfFrame: HTMLIFrameElement, order: AdminOrder, products: Map<number, AdminProduct>): Promise<void> {
    const orderNumber = escapeHtml(order.orderNumber);
    const placed = escapeHtml(new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
    }).toUpperCase());
    const address = [order.addressLine, order.city, order.state, `PIN ${order.pincode}`]
      .filter(Boolean).map(escapeHtml);
    let productImageData: (string | null)[];
    try {
      productImageData = await Promise.all(order.items.map(async item => {
        const product = products.get(item.productId);
        const imageUrl = item.imageUrl
          || product?.images.find(productImage => productImage.isPrimary)?.url
          || product?.images[0]?.url;
        return imageUrl ? this.loadImageDataUrl(imageUrl) : null;
      }));
    } catch (error) {
      console.error('Could not load order product photos for PDF.', error);
      this.pdfError.set(error instanceof Error && error.message.includes('CORS')
        ? 'Product photos could not be included. The image server must allow cross-origin (CORS) access.'
        : 'Could not load product photos for the order summary. Please try again.');
      this.pdfLoadingId.set(null);
      pdfFrame.remove();
      return;
    }
    const rowHeight = Math.min(31, 95 / Math.max(order.items.length, 1));
    const detailItems = order.items.map((item, index) => {
      const product = products.get(item.productId);
      const color = product?.color.trim();
      const fabric = product?.fabric.trim();
      const image = `<span class="product-image">${productImageData[index]
        ? `<img src="${escapeHtml(productImageData[index])}" alt="">`
        : ''}</span>`;
      return `<article class="product" style="flex-basis:calc(${rowHeight}% - 1mm)">
        ${image}
        <div class="product-copy">
          <strong>${escapeHtml(item.productName)}</strong>
          <span>${color ? `${escapeHtml(color)} / ` : ''}SIZE ${escapeHtml(item.size)}</span>
          <small>${fabric ? `${escapeHtml(fabric)} · ` : ''}Qty ${item.quantity} × ${formatRupees(item.unitPrice)}</small>
        </div>
        <strong class="line-total">${formatRupees(item.lineTotal)}</strong>
      </article>`;
    }).join('');
    const normalizedStatus = order.status;
    const status = escapeHtml(normalizedStatus.toUpperCase());
    const statusIcon = normalizedStatus === 'Pending'
      ? '<svg viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5" /><path d="M7 4v3l2 1.3" /></svg>'
      : ['Delivered', 'Confirmed', 'Packed', 'Shipped'].includes(normalizedStatus)
        ? '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="m2.5 7.2 2.7 2.6 6.3-6.1" /></svg>'
        : '';
    const payment = escapeHtml(`${this.paymentLabel(order.paymentMethod)} · ${order.paymentStatus}`);
    const templateUrl = escapeHtml(new URL('/assets/order-summary-template.png', document.baseURI).href);
    const subtotal = formatRupees(order.subtotal);
    const shipping = formatRupees(order.shippingCharge);
    const total = formatRupees(order.total);
    const discount = Math.max(0, order.subtotal + order.shippingCharge - order.total);
    const count = order.items.reduce((sum, item) => sum + item.quantity, 0);

    const pdfDocument = pdfFrame.contentDocument;
    if (!pdfDocument) {
      this.pdfLoadingId.set(null);
      this.pdfError.set('Could not prepare the order summary PDF. Please try again.');
      pdfFrame.remove();
      return;
    }
    pdfDocument.open();
    pdfDocument.write(`<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <base href="${escapeHtml(document.baseURI)}">
          <title>Order summary - ${orderNumber}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link id="summary-fonts" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:wght@400;700&display=swap">
          <style>
            @page { size: A4 portrait; margin: 0; }
            * { box-sizing: border-box; }
            html, body { width: 210mm; height: 297mm; margin: 0; }
            body { color: #302a28; font: 10px Inter, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .sheet { position: relative; width: 210mm; height: 297mm; overflow: hidden; background: #fffaf5; }
            .template { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
            .meta { position: absolute; top: 9.7%; right: 5.5%; width: 35%; padding: 1mm 0; background: #fffaf5; color: #302a38; font-size: 10px; text-align: right; }
            .status { position: absolute; top: 14%; left: 5.4%; display: flex; width: 89.2%; height: 4.3%; align-items: center; gap: 4%; padding: 0 4%; border-radius: 3mm; background: #f8e3df; color: #75152f; }
            .status strong { display: flex; width: 42%; align-items: center; gap: 3mm; font: 700 14px Inter, sans-serif; letter-spacing: .4px; text-transform: uppercase; }
            .status svg { width: 7mm; height: 7mm; flex: 0 0 7mm; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.5; }
            .status span { padding-left: 4%; border-left: 1px solid #c78387; color: #78696b; font-size: 10px; text-transform: uppercase; }
            .delivery { position: absolute; top: 22.6%; left: 5.4%; display: grid; width: 89.2%; height: 9.8%; grid-template-columns: 1fr 1fr; gap: 6%; padding: 2.5mm 3.6%; overflow: hidden; border-radius: 3mm; background: #fbf1eb; }
            .delivery > div + div { padding-left: 12%; border-left: 1px solid #cb9993; }
            .delivery strong { display: block; margin-bottom: 1mm; color: #841d37; font: 700 11px Inter, sans-serif; letter-spacing: .3px; text-transform: uppercase; }
            .delivery p { margin: 0; overflow: hidden; color: #302a38; font: 400 11px/1.32 Inter, sans-serif; }
            .product-mask { position: absolute; z-index: 1; top: 36.8%; left: 5.4%; width: 89.2%; height: 30.5%; background: #fffaf5; }
            .products { position: absolute; z-index: 2; top: 36.8%; left: 5.4%; display: flex; width: 89.2%; height: 30.5%; flex-direction: column; gap: 1mm; padding: 0; overflow: hidden; background: #fffaf5; }
            .product { position: relative; isolation: isolate; display: flex; min-height: 0; flex-grow: 0; flex-shrink: 0; align-items: center; gap: 3%; padding: 1.5mm 2%; overflow: hidden; border: 1px solid #f1dfd7; border-radius: 2.5mm; background: #fffaf5; }
            .product-image { display: grid; width: 15%; max-height: 100%; aspect-ratio: 1; flex: 0 0 15%; place-items: center; overflow: hidden; border-radius: 2mm; background: #f9eee8; }
            .product-image img { display: block; width: 100%; height: 100%; object-fit: contain; }
            .product-copy { position: relative; z-index: 1; display: grid; min-width: 0; flex: 1 1 0; align-content: center; gap: 1mm; padding: 1mm 0; overflow: hidden; background-color: #fffaf5; isolation: isolate; }
            .product-copy strong { display: block; min-width: 0; max-width: 100%; overflow: hidden; background: #fffaf5; color: #77142d; font: 600 15px/1.2 "Cormorant Garamond", Georgia, serif; font-kerning: none; font-variant-ligatures: none; letter-spacing: .1mm; text-overflow: ellipsis; white-space: nowrap; }
            .product-copy span { color: #6f6265; font: 400 11px Inter, sans-serif; text-transform: uppercase; }
            .product-copy small { color: #817578; font: 400 10px Inter, sans-serif; }
            .line-total { flex: 0 0 auto; background: #fffaf5; color: #77142d; font: 700 17px Inter, sans-serif; white-space: nowrap; }
            .totals { position: absolute; top: 68.7%; left: 5.4%; display: flex; width: 89.2%; height: 13%; flex-direction: column; justify-content: flex-start; padding: 1.5mm 4% 0; overflow: hidden; border: 1px solid #e8d1c8; border-radius: 2.5mm; background: #fffaf5; color: #302a38; font: 400 13px Inter, sans-serif; }
            .totals div { display: flex; flex-wrap: nowrap; align-items: center; gap: 4mm; }
            .totals div > :first-child { min-width: 0; }
            .totals div > :last-child { flex: 0 0 auto; margin-left: auto; font-weight: 700; text-align: right; white-space: nowrap; }
            .totals > div:not(.grand) { min-height: 7mm; }
            .totals .grand { min-height: 13mm; justify-content: space-between; margin: auto -4.7% 0; padding: 0 4.7%; background: #f8e3df; color: #77142d; font: 700 18px Inter, sans-serif; letter-spacing: .5px; text-transform: uppercase; }
            .thanks { position: absolute; top: 83.2%; left: 17%; width: 69%; height: 7.9%; display: flex; flex-direction: column; justify-content: center; padding: 2mm 3%; overflow: hidden; border-radius: 2mm; background: #fbf1eb; }
            .thanks strong { margin-bottom: 1.5mm; color: #77142d; font: 700 15px Inter, sans-serif; }
            .thanks span { color: #6e6061; font: 400 11px/1.4 Inter, sans-serif; }
            @media screen { body { background: #ddd; } .sheet { margin: 0 auto; box-shadow: 0 2mm 8mm #0003; } }
          </style>
        </head>
        <body>
          <main class="sheet">
            <img class="template" src="${templateUrl}" alt="">
            <div class="meta">${placed} &nbsp; · &nbsp; ORDER #${orderNumber}</div>
            <section class="status"><strong>${statusIcon}${status}</strong><span>${payment}</span></section>
            <section class="delivery">
              <div><strong>Deliver to</strong><p>${escapeHtml(order.customerName)}<br>${address.join('<br>')}</p></div>
              <div><strong>Contact &amp; payment</strong><p>Mobile: ${escapeHtml(order.phone)}<br>${escapeHtml(this.paymentLabel(order.paymentMethod))}${order.courierName ? `<br>Courier: ${escapeHtml(order.courierName)}` : ''}${order.trackingNumber ? `<br>Tracking: ${escapeHtml(order.trackingNumber)}` : ''}</p></div>
            </section>
            <div class="product-mask" aria-hidden="true"></div>
            <section class="products">${detailItems}</section>
            <section class="totals">
              <div><span>Subtotal · ${count} ${count === 1 ? 'item' : 'items'}</span><span>${subtotal}</span></div>
              ${discount > 0 ? `<div><span>Collection discount</span><span>− ${formatRupees(discount)}</span></div>` : ''}
              <div><span>Estimated shipping</span><span>${shipping}</span></div>
              <div class="grand"><span>Total payable</span><span>${total}</span></div>
            </section>
            <section class="thanks"><strong>Thank you for choosing Sahjish Fashion!</strong><span>Your order is ${status.toLowerCase()}. For assistance, contact the store through WhatsApp.</span></section>
          </main>
        </body>
      </html>`);
    pdfDocument.close();
    try {
      await this.waitForPdfImages(pdfDocument);
      const template = pdfDocument.querySelector<HTMLImageElement>('.template');
      const sheet = pdfDocument.querySelector<HTMLElement>('.sheet');
      if (!template || template.naturalWidth === 0 || !sheet) {
        throw new Error('Order summary artwork did not load.');
      }
      await this.waitForPdfFonts(pdfDocument);
      const canvas = await this.capturePdfElement(sheet);
      await this.savePdfCanvas(canvas, 210, 297, `order-summary-${this.safeFilename(order.orderNumber)}.pdf`);
    } catch (error) {
      console.error('Could not generate the order summary PDF.', error);
      this.pdfError.set(error instanceof Error && error.message.includes('CORS')
        ? 'Product photos could not be included. The image server must allow cross-origin (CORS) access.'
        : 'Could not generate the order summary PDF. Check your connection and try again.');
    } finally {
      this.pdfLoadingId.set(null);
      pdfFrame.remove();
    }
  }

  private async renderThankYouCard(pdfFrame: HTMLIFrameElement, order: AdminOrderSummary): Promise<void> {
    const pdfDocument = pdfFrame.contentDocument;
    if (!pdfDocument) {
      this.pdfLoadingId.set(null);
      this.pdfError.set('Could not prepare the thank-you PDF. Please try again.');
      pdfFrame.remove();
      return;
    }
    const cardImageUrl = escapeHtml(new URL('/assets/thank-you-card.png', document.baseURI).href);
    pdfDocument.open();
    pdfDocument.write(`<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <base href="${escapeHtml(document.baseURI)}">
          <title>Thank-you card</title>
          <style>
            @page { size: 4in 6in; margin: 0; }
            * { box-sizing: border-box; }
            html, body { width: 4in; height: 6in; margin: 0; }
            body { font-family: Arial, sans-serif; }
            .card { position: relative; width: 4in; height: 6in; overflow: hidden; }
            .card img { display: block; width: 100%; height: 100%; }
            .customer-name { position: absolute; top: 49.8%; left: 52%; width: max-content; max-width: 37%; overflow: hidden;
              transform: translate(-50%, -65%); color: #77142d;
              font-family: "Segoe Script", "Brush Script MT", "Apple Chancery", cursive;
              font-size: 14px; font-style: italic; font-weight: 500; line-height: 1;
              text-align: center; white-space: nowrap; }
            .hint { position: fixed; top: 12px; left: 12px; padding: 8px 12px; background: #fff;
              color: #333; font: 14px Arial, sans-serif; }
            @media print { .hint { display: none; } }
          </style>
        </head>
        <body>
          <main class="card">
            <img id="card-image" src="${cardImageUrl}" alt="Sahjish Fashion thank-you card">
            <span id="customer-name" class="customer-name">${escapeHtml(order.customerName)}</span>
          </main>
        </body>
      </html>`);
    pdfDocument.close();
    try {
      await this.waitForPdfImages(pdfDocument);
      const card = pdfDocument.querySelector<HTMLElement>('.card');
      const image = pdfDocument.querySelector<HTMLImageElement>('#card-image');
      if (!card || !image || image.naturalWidth === 0) throw new Error('Thank-you card artwork did not load.');
      const canvas = await this.capturePdfElement(card);
      await this.savePdfCanvas(canvas, 101.6, 152.4, `thank-you-${this.safeFilename(order.orderNumber)}.pdf`);
    } catch (error) {
      console.error('Could not generate the thank-you PDF.', error);
      this.pdfError.set('Could not generate the thank-you PDF. Please try again.');
    } finally {
      this.pdfLoadingId.set(null);
      pdfFrame.remove();
    }
  }

  private createPdfFrame(): HTMLIFrameElement {
    const frame = document.createElement('iframe');
    frame.title = 'PDF rendering surface';
    frame.style.cssText = 'position:fixed;left:0;top:0;width:210mm;height:297mm;border:0;opacity:0;pointer-events:none;z-index:9999;';
    document.body.append(frame);
    return frame;
  }

  private async waitForPdfImages(pdfDocument: Document): Promise<void> {
    await Promise.all(Array.from(pdfDocument.images).map(image => {
      if (image.complete) {
        return image.naturalWidth > 0 ? Promise.resolve() : Promise.reject(new Error(`Image failed to load: ${image.src}`));
      }
      return new Promise<void>((resolve, reject) => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => reject(new Error(`Image failed to load: ${image.src}`)), { once: true });
      });
    }));
  }

  private async loadImageDataUrl(imageUrl: string): Promise<string> {
    if (imageUrl.startsWith('data:image/')) return imageUrl;

    let response: Response;
    try {
      response = await fetch(new URL(imageUrl, document.baseURI), { mode: 'cors', cache: 'no-store' });
    } catch {
      throw new Error(`Could not load product photo because CORS blocked it: ${imageUrl}`);
    }
    if (!response.ok) throw new Error(`Could not load product photo (${response.status}): ${imageUrl}`);

    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) throw new Error(`Product photo response is not an image: ${imageUrl}`);
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error(`Could not read product photo: ${imageUrl}`));
      }, { once: true });
      reader.addEventListener('error', () => reject(new Error(`Could not read product photo: ${imageUrl}`)), { once: true });
      reader.readAsDataURL(blob);
    });
  }

  private async waitForPdfFonts(pdfDocument: Document): Promise<void> {
    const fontStylesheet = pdfDocument.querySelector<HTMLLinkElement>('#summary-fonts');
    if (!fontStylesheet) throw new Error('Order summary fonts are missing.');
    if (!fontStylesheet.sheet) {
      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error('Timed out loading PDF fonts.')), 15000);
        fontStylesheet.addEventListener('load', () => {
          window.clearTimeout(timeout);
          resolve();
        }, { once: true });
        fontStylesheet.addEventListener('error', () => {
          window.clearTimeout(timeout);
          reject(new Error('Could not load PDF fonts.'));
        }, { once: true });
      });
    }
    await pdfDocument.fonts.load('600 15px "Cormorant Garamond"');
    await pdfDocument.fonts.load('700 13px Inter');
    await pdfDocument.fonts.ready;
  }

  private async capturePdfElement(element: HTMLElement): Promise<HTMLCanvasElement> {
    const { default: html2canvas } = await import('html2canvas');
    return html2canvas(element, { backgroundColor: '#fffaf5', scale: 2, useCORS: true, logging: false });
  }

  private async savePdfCanvas(canvas: HTMLCanvasElement, widthMm: number, heightMm: number, filename: string): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [widthMm, heightMm],
      compress: true,
    });
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.96), 'JPEG', 0, 0, widthMm, heightMm);
    pdf.save(filename);
  }

  private safeFilename(value: string): string {
    return value.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').replace(/\s+/g, '-');
  }

  retry(): void {
    this.reloadTick.update(n => n + 1);
  }

  paymentLabel(method: string): string {
    return method === 'Cod' ? 'Cash on delivery' : method;
  }
}
