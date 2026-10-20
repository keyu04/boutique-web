import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { BRAND, ShippingApi } from '@shared';
import { BagLine, BagService } from '../../core/bag.service';
import { SiteHeader } from '../../core/site-header';
import { SiteFooter } from '../../core/site-footer';

interface ShippingResult {
    signature: string; // which bag contents this estimate was calculated for
    pincode: string;
    charge: number;
    eta: string;
}

@Component({
    selector: 'app-bag',
    imports: [CurrencyPipe, RouterLink, SiteHeader, SiteFooter],
    templateUrl: './bag.html',
    styleUrl: './bag.scss',
})
export class BagPage {
    readonly bag = inject(BagService);
    private readonly shippingApi = inject(ShippingApi);
    private readonly destroyRef = inject(DestroyRef);

    readonly pincode = signal('');
    readonly checking = signal(false);
    readonly shippingError = signal<string | null>(null);
    private readonly result = signal<ShippingResult | null>(null);

    private readonly signature = computed(() =>
        this.bag.lines().map(l => `${l.variantId}x${l.quantity}`).join(','));

    /** The estimate only counts while the bag still matches what it was calculated for. */

    readonly shipping = computed(() => {
        const r = this.result();
        return r && r.signature === this.signature() && r.pincode === this.pincode().trim() ? r : null;
    });
    readonly total = computed(() => this.bag.subtotal() + (this.shipping()?.charge ?? 0));

    constructor() {
        inject(Title).setTitle(`Your bag | ${BRAND.name}`);
    }

    change(line: BagLine, delta: number): void {
        this.bag.setQuantity(line.variantId, line.quantity + delta);
    }

    quantityLimitMessage(line: BagLine): string {
        if (line.maxQuantity >= 10) return 'You’ve reached the limit of 10 per size.';
        return `You’ve added all ${line.maxQuantity} available ${line.maxQuantity === 1 ? 'item' : 'items'} in this size.`;
    }

    checkShipping(event: Event): void {
        event.preventDefault();
        const pincode = this.pincode().trim();
        if (!/^[1-9]\d{5}$/.test(pincode)) {
            this.shippingError.set('Enter a valid 6-digit pincode.');
            return;
        }

        const signature = this.signature();
        this.checking.set(true);
        this.shippingError.set(null);

        this.shippingApi.estimate({
            pincode,
            paymentMethod: 'Prepaid',
            items: this.bag.lines().map(l => ({ variantId: l.variantId, quantity: l.quantity })),
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: r => {
                this.result.set({ signature, pincode, charge: r.charge, eta: r.eta });
                this.checking.set(false);
            },
            error: (e: HttpErrorResponse) => {
                this.result.set(null);
                this.shippingError.set(
                    e.error?.error ?? e.error?.title ?? 'Could not estimate shipping. Please try again.');
                this.checking.set(false);
            },
        });
    }
}