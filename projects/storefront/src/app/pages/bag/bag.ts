import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { ShippingApi, ShippingEstimate } from '@shared';
import { BagLine, BagService } from '../../core/bag.service';
import { FreeDelivery } from '../../core/free-delivery';
import { formatPageTitle } from '../../core/page-title';
import { SiteHeader } from '../../core/site-header';
import { SiteFooter } from '../../core/site-footer';

type ShippingResult = ShippingEstimate & { pincode: string };

// The bag estimates COD shipping before a payment method is selected at checkout.
const PAYMENT_METHOD = 'Cod';

@Component({
    selector: 'app-bag',
    imports: [CurrencyPipe, DatePipe, RouterLink, SiteHeader, SiteFooter, FreeDelivery],
    templateUrl: './bag.html',
    styleUrl: './bag.scss',
})
export class BagPage {
    readonly bag = inject(BagService);
    private readonly router = inject(Router);
    private readonly shippingApi = inject(ShippingApi);
    private readonly destroyRef = inject(DestroyRef);

    readonly pincode = signal('');
    readonly checking = signal(false);
    readonly shippingError = signal<string | null>(null);
    private readonly result = signal<ShippingResult | null>(null);
    private requestId = 0;   // lets us ignore an older response that arrives late
    private requestedPincode: string | null = null;

    private readonly signature = computed(() =>
        this.bag.lines().map(l => `${l.variantId}x${l.quantity}`).join(','));

    /** The last estimate, as long as the pincode box still holds the pincode it was calculated for. */
    readonly shipping = computed(() => {
        const r = this.result();
        return r && r.pincode === this.pincode().trim() ? r : null;
    });
    readonly total = computed(() => this.bag.subtotal() + (this.shipping()?.charge ?? 0));

    constructor() {
        inject(Title).setTitle(formatPageTitle('Your bag'));

        // Once a pincode has been checked, quietly refresh the estimate whenever the bag changes.
        effect(() => {
            this.signature();
            untracked(() => {
                const r = this.result();
                if (r && this.bag.lines().length > 0) this.estimate(r.pincode);
            });
        });
    }

    goToCheckout(): void {
        const shipping = this.shipping();
        if (!shipping || this.checking() || this.bag.lines().length === 0) return;
        void this.router.navigate(['/checkout'], { state: { checkedPincode: shipping.pincode } });
    }

    change(line: BagLine, delta: number): void {
        this.bag.setQuantity(line.variantId, line.quantity + delta);
    }

    quantityLimitMessage(line: BagLine): string {
        if (line.maxQuantity >= 10) return 'You’ve reached the limit of 10 per size.';
        return `You’ve added all ${line.maxQuantity} available ${line.maxQuantity === 1 ? 'item' : 'items'} in this size.`;
    }

    onPincodeInput(value: string): void {
        const pincode = value.trim();
        this.pincode.set(pincode);
        this.shippingError.set(null);

        if (!/^[1-9]\d{5}$/.test(pincode)) {
            ++this.requestId;
            this.requestedPincode = null;
            this.checking.set(false);
            if (pincode.length === 6) this.shippingError.set('Enter a valid 6-digit pincode.');
            return;
        }

        if (this.shipping()?.pincode === pincode ||
            (this.checking() && this.requestedPincode === pincode)) return;

        this.estimate(pincode);
    }

    private estimate(pincode: string): void {
        const request = ++this.requestId;
        this.requestedPincode = pincode;
        this.checking.set(true);
        this.shippingError.set(null);

        this.shippingApi.estimate({
            pincode,
            paymentMethod: PAYMENT_METHOD,
            items: this.bag.lines().map(l => ({ variantId: l.variantId, quantity: l.quantity })),
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: r => {
                if (request !== this.requestId) return;
                this.result.set({ ...r, pincode });
                this.requestedPincode = null;
                this.checking.set(false);
            },
            error: (e: HttpErrorResponse) => {
                if (request !== this.requestId) return;
                this.result.set(null);
                this.requestedPincode = null;
                this.shippingError.set(
                    e.error?.error ?? e.error?.title ?? 'Could not estimate shipping. Please try again.');
                this.checking.set(false);
            },
        });
    }
}
