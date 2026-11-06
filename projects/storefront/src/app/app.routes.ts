import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'product/:slug',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then(m => m.ProductDetailPage),
  },
  {
    path: 'bag',
    loadComponent: () => import('./pages/bag/bag').then(m => m.BagPage),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout').then(m => m.CheckoutPage),
  },
  {
    path: 'order/:orderNumber',
    loadComponent: () =>
      import('./pages/order-confirmation/order-confirmation').then(m => m.OrderConfirmationPage),
  },
  {
    path: 'track',
    loadComponent: () => import('./pages/track-order/track-order').then(m => m.TrackOrderPage),
  },
  { path: '**', redirectTo: '' },
];
