import { InjectionToken } from '@angular/core';

// Each app provides its own value, so the API address lives in one place per app.
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');