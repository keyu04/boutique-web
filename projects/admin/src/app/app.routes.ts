import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { Shell } from '../app/layout/shell';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('../app/pages/login/login').then(m => m.LoginPage),
  },
  { path: 'unavailable', loadComponent: () => import('./pages/unavailable/unavailable').then(m => m.UnavailablePage) },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('../app/pages/dashboard/dashboard').then(m => m.DashboardPage),
      },
      {
        path: 'products',
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
        loadComponent: () => import('./pages/products/product-list').then(m => m.ProductListPage),
      },
      {
        path: 'products/new',
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
        loadComponent: () => import('./pages/products/product-form').then(m => m.ProductFormPage),
      },
      {
        path: 'products/:id',
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
        loadComponent: () => import('./pages/products/product-form').then(m => m.ProductFormPage),
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders/order-list').then(m => m.OrderListPage),
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./pages/orders/order-detail').then(m => m.OrderDetailPage),
      },
      {
        path: 'reports',
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
        loadComponent: () => import('./pages/reports/reports').then(m => m.ReportsPage),
      },
      {
        path: 'instagram-posts',
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
        loadComponent: () => import('./pages/instagram-posts/instagram-posts').then(m => m.InstagramPostsPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
