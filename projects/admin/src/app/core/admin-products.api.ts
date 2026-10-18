import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL, Page } from '@shared';
import { AdminProductSummary, CreateProductRequest, CreatedProduct } from './admin-models';

@Injectable({ providedIn: 'root' })
export class AdminProductsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(page: number, pageSize: number) {
    return this.http.get<Page<AdminProductSummary>>(`${this.baseUrl}/admin/products`, {
      params: { page, pageSize },
    });
  }

  create(request: CreateProductRequest) {
    return this.http.post<CreatedProduct>(`${this.baseUrl}/admin/products`, request);
  }
}