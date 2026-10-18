import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL, Page } from '@shared';
import { AdminOrder, AdminOrderSummary, ReportSummary } from './order-models';

@Injectable({ providedIn: 'root' })
export class AdminOrdersApi {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = inject(API_BASE_URL);

    list(page: number, pageSize: number, filters: { q?: string; status?: string; from?: string; to?: string } = {}) {
        let params = new HttpParams().set('page', page).set('pageSize', pageSize);
        for (const [key, value] of Object.entries(filters)) {
            if (value) params = params.set(key, value);
        }
        return this.http.get<Page<AdminOrderSummary>>(`${this.baseUrl}/admin/orders`, { params });
    }

    setTracking(id: number, courierName: string, trackingNumber: string) {
        return this.http.patch<AdminOrder>(`${this.baseUrl}/admin/orders/${id}/tracking`, { courierName, trackingNumber });
    }

    get(id: number) {
        return this.http.get<AdminOrder>(`${this.baseUrl}/admin/orders/${id}`);
    }

    /** The API answers with the full updated order. */
    setStatus(id: number, status: string) {
        return this.http.patch<AdminOrder>(`${this.baseUrl}/admin/orders/${id}/status`, { status });
    }
}

@Injectable({ providedIn: 'root' })
export class ReportsApi {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = inject(API_BASE_URL);

    /** With no dates the API uses the last 30 days. */
    summary(from?: string, to?: string) {
        let params = new HttpParams();
        if (from) params = params.set('from', from);
        if (to) params = params.set('to', to);
        return this.http.get<ReportSummary>(`${this.baseUrl}/admin/reports/summary`, { params });
    }
}