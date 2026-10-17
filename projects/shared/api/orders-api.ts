import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from './api-config';
import { CreateOrderRequest, OrderResult } from '../src/model/orders';

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  create(request: CreateOrderRequest) {
    return this.http.post<OrderResult>(`${this.baseUrl}/orders`, request);
  }
}