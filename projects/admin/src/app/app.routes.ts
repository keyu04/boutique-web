import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { Shell } from '../app/layout/shell';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('../app/pages/login/login').then(m => m.LoginPage),
    },
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
            // products, orders and reports come next
        ],
    },
    { path: '**', redirectTo: '' },
];