import { provideHttpClient } from '@angular/common/http';
import { API_BASE_URL } from '@shared';
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from '../../../admin/src/app/core/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'top',
    })),
    provideHttpClient(),
    { provide: API_BASE_URL, useValue: 'https://boutique-backend-rqz2.onrender.com/api' },
    provideAppInitializer(() => inject(AuthService).restore()),
  ],


};
