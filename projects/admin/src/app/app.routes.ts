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
            // products, orders and reports come next
        ],
    },
    { path: '**', redirectTo: '' },
];