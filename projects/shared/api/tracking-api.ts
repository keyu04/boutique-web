import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TrackedOrder } from '../../shared/src/model/tracking';
import { API_BASE_URL } from './api-config';

@Injectable({ providedIn: 'root' })
export class TrackingApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /** The phone goes in the body, never in the URL, so it stays out of logs and browser history. */
  track(orderNumber: string, phone: string) {
    return this.http.post<TrackedOrder>(`${this.baseUrl}/orders/track`, { orderNumber, phone });
  }
}
