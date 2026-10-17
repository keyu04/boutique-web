import { provideHttpClient } from '@angular/common/http';
import { API_BASE_URL } from '@shared';
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from '../../../admin/src/app/core/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    { provide: API_BASE_URL, useValue: 'http://localhost:5120/api' },
    provideAppInitializer(() => inject(AuthService).restore()),
  ],


};
