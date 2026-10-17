import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { API_BASE_URL } from '@shared';
import { Observable, catchError, finalize, firstValueFrom, map, of, shareReplay, tap } from 'rxjs';

export interface Session {
  accessToken: string;
  expiresAtUtc: string;
  displayName: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly _session = signal<Session | null>(null);
  private refreshing$: Observable<Session> | null = null;

  readonly isAuthenticated = computed(() => this._session() !== null);
  readonly displayName = computed(() => this._session()?.displayName ?? '');
  readonly roles = computed(() => this._session()?.roles ?? []);
  readonly isAdmin = computed(() => this.roles().includes('Admin'));

  accessToken(): string | null {
    return this._session()?.accessToken ?? null;
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  login(email: string, password: string): Observable<Session> {
    return this.http
      .post<Session>(`${this.baseUrl}/auth/login`, { email, password }, { withCredentials: true })
      .pipe(tap(session => this._session.set(session)));
  }

  /** One refresh at a time: concurrent callers share the same in-flight request. */
  refresh(): Observable<Session> {
    if (!this.refreshing$) {
      this.refreshing$ = this.http
        .post<Session>(`${this.baseUrl}/auth/refresh`, {}, { withCredentials: true })
        .pipe(
          tap(session => this._session.set(session)),
          finalize(() => (this.refreshing$ = null)),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
    }
    return this.refreshing$;
  }

  /** Runs once at app start: restores the session from the refresh cookie, if there is one. */
  restore(): Promise<void> {
    return firstValueFrom(
      this.refresh().pipe(
        catchError(() => of(null)),
        map(() => undefined),
      ),
    );
  }

  logout(): Observable<void> {
    return this.http
      .post(`${this.baseUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        catchError(() => of(null)), // sign out locally even if the server call fails
        tap(() => this._session.set(null)),
        map(() => undefined),
      );
  }

  clear(): void {
    this._session.set(null);
  }
}