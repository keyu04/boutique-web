import { provideHttpClient } from '@angular/common/http';
import { API_BASE_URL } from '@shared';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes),
  provideHttpClient(),
  { provide: API_BASE_URL, useValue: 'http://localhost:5120/api' },],

};
