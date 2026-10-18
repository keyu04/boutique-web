import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BRAND, apiMessage } from '@shared';
import { AdminOrdersApi } from '../../core/admin-orders.api';
import { AdminOrder } from '../../core/order-models';
import { StatusBadge } from '../../core/status-badge';

const ACTION_LABELS: Record<string, string> = {
    Confirmed: 'Confirm order',
    Packed: 'Mark as packed',
    Shipped: 'Mark as shipped',
    Delivered: 'Mark as delivered',
    Cancelled: 'Cancel order',
};

@Component({
    selector: 'app-order-detail',
    imports: [CurrencyPipe, DatePipe, RouterLink, StatusBadge],
    templateUrl: './order-detail.html',
    styleUrl: './order-detail.scss',
})
export class OrderDetailPage {
    private readonly api = inject(AdminOrdersApi);
    private readonly destroyRef = inject(DestroyRef);
    private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

    readonly state = signal<'loading' | 'ready' | 'notfound' | 'error'>('loading');
    readonly order = signal<AdminOrder | null>(null);
    readonly updating = signal(false);
    readonly actionError = signal<string | null>(null);

    readonly courier = signal('');
    readonly tracking = signal('');
    readonly savingTracking = signal(false);
    readonly trackingError = signal<string | null>(null);
    readonly trackingSaved = signal(false);

    /** Worth entering once the parcel is packed, until it is delivered. */
    readonly canEditTracking = computed(() => ['Packed', 'Shipped'].includes(this.order()?.status ?? ''));

    saveTracking(event: Event): void {
        event.preventDefault();
        const courierName = this.courier().trim();
        const trackingNumber = this.tracking().trim();
        this.trackingSaved.set(false);
        if (!courierName || !trackingNumber) {
            this.trackingError.set('Enter both the courier and the tracking number.');
            return;
        }
        this.savingTracking.set(true);
        this.trackingError.set(null);
        this.api.setTracking(this.id, courierName, trackingNumber).subscribe({
            next: updated => {
                this.order.set(updated);
                this.savingTracking.set(false);
                this.trackingSaved.set(true);
            },
            error: (e: HttpErrorResponse) => {
                this.savingTracking.set(false);
                this.trackingError.set(apiMessage(e, 'Could not save the tracking details.'));
            },
        });
    }

    /** Cost and margin only exist for Admin: the API leaves unitCost out for Staff. */
    readonly costTotal = computed(() => {
        const o = this.order();
        if (!o || o.items.length === 0 || o.items.some(i => i.unitCost == null)) return null;
        return o.items.reduce((sum, i) => sum + (i.unitCost ?? 0) * i.quantity, 0);
    });
    readonly margin = computed(() => {
        const o = this.order();
        const cost = this.costTotal();
        return o && cost != null ? o.subtotal - cost : null;
    });

    constructor() {
        inject(Title).setTitle(`Order | ${BRAND.name} Admin`);
        if (!Number.isInteger(this.id) || this.id < 1) {
            this.state.set('notfound');
            return;
        }
        this.api.get(this.id).pipe(takeUntilDestroyed()).subscribe({
            next: order => {
                this.order.set(order);
                this.courier.set(order.courierName ?? '');
                this.tracking.set(order.trackingNumber ?? '');
                this.state.set('ready');
            },
            error: (e: HttpErrorResponse) => this.state.set(e.status === 404 ? 'notfound' : 'error'),
        });
    }

    actionLabel(status: string): string {
        return ACTION_LABELS[status] ?? status;
    }

    paymentLabel(method: string): string {
        return method === 'Cod' ? 'Cash on delivery' : method;
    }

    changeStatus(status: string): void {
        if (this.updating()) return;
        if (status === 'Cancelled' && !confirm('Cancel this order? The reserved stock goes back on the shelf.')) return;

        this.updating.set(true);
        this.actionError.set(null);
        this.api.setStatus(this.id, status).subscribe({
            next: updated => {
                this.order.set(updated);
                this.updating.set(false);
            },
            error: (e: HttpErrorResponse) => {
                this.updating.set(false);
                this.actionError.set(apiMessage(e));
                this.refresh(); // someone else may have changed it: show the current state
            },
        });
    }

    private refresh(): void {
        this.api.get(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: order => this.order.set(order),
            error: () => undefined,
        });
    }
}