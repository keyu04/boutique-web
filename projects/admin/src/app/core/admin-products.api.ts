import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL, Page } from '@shared';
import { AdminProduct, AdminProductSummary, CreateProductRequest } from './admin-models';

@Injectable({ providedIn: 'root' })
export class AdminProductsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private url(path = '') { return `${this.baseUrl}/admin/products${path}`; }

  list(page: number, pageSize: number, q = '') {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (q) params = params.set('q', q);
    return this.http.get<Page<AdminProductSummary>>(this.url(), { params });
  }

  get(id: number) { return this.http.get<AdminProduct>(this.url(`/${id}`)); }
  create(request: CreateProductRequest) { return this.http.post<AdminProduct>(this.url(), request); }
  update(id: number, request: CreateProductRequest) { return this.http.put<void>(this.url(`/${id}`), request); }
  setActive(id: number, isActive: boolean) { return this.http.patch<void>(this.url(`/${id}/active`), { isActive }); }

  uploadImages(id: number, files: File[]) {
    const form = new FormData();
    for (const file of files) form.append('files', file); // field name the API expects
    return this.http.post<unknown>(this.url(`/${id}/images`), form);
  }

  reorderImages(id: number, imageIds: number[]) {
    return this.http.put<unknown>(this.url(`/${id}/images/order`), { imageIds });
  }

  setPrimary(id: number, imageId: number) {
    return this.http.patch<unknown>(this.url(`/${id}/images/${imageId}/primary`), {});
  }

  deleteImage(id: number, imageId: number) {
    return this.http.delete<unknown>(this.url(`/${id}/images/${imageId}`));
  }
}