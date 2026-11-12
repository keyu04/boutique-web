import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { API_BASE_URL } from '@shared';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';
import { AuthService } from './core/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: API_BASE_URL, useValue: 'https://boutique-web-vuf0.onrender.com/api' },
    provideAppInitializer(() => inject(AuthService).restore()),
  ],
};
