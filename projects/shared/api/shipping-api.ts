import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from './api-config';
import { ShippingEstimate, ShippingEstimateRequest } from '../src/model/shipping';

@Injectable({ providedIn: 'root' })
export class ShippingApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  estimate(request: ShippingEstimateRequest) {
    return this.http.post<ShippingEstimate>(`${this.baseUrl}/shipping/estimate`, request);
  }
}