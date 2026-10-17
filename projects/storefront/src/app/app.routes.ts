import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
    { path: '', component: Home },
    {
        path: 'product/:slug',
        loadComponent: () =>
            import('./pages/product-detail/product-detail').then(m => m.ProductDetailPage),
    },
    { path: '**', redirectTo: '' },
];