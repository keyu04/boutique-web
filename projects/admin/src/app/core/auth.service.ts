import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { API_BASE_URL } from '@shared';
import { Observable, catchError, finalize, firstValueFrom, map, of, shareReplay, tap, timeout } from 'rxjs';

export interface Session {
  accessToken: string;
  expiresAtUtc: string;
  displayName: string;
  roles: string[];
}

/** True only when the server answered and said "this session is not valid". */
export function isAuthRejection(error: unknown): boolean {
  return error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403);
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly _session = signal<Session | null>(null);
  private readonly _unreachable = signal(false);
  private refreshing$: Observable<Session> | null = null;

  readonly isAuthenticated = computed(() => this._session() !== null);
  readonly displayName = computed(() => this._session()?.displayName ?? '');
  readonly roles = computed(() => this._session()?.roles ?? []);
  readonly isAdmin = computed(() => this.roles().includes('Admin'));
  /** True when the last attempt to restore the session could not reach the server (as opposed to being rejected). */
  readonly unreachable = this._unreachable.asReadonly();

  accessToken(): string | null {
    return this._session()?.accessToken ?? null;
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  login(email: string, password: string): Observable<Session> {
    return this.http
      .post<Session>(`${this.baseUrl}/auth/login`, { email, password }, { withCredentials: true })
      .pipe(tap(session => { this._session.set(session); this._unreachable.set(false); }));
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

  /**
   * Runs at app start, and again when the person presses Retry.
   * A rejected session (401/403) means "signed out". Anything else (server down, timeout, 5xx)
   * means we simply could not ask, so the person is NOT treated as signed out.
   */
  restore(): Promise<void> {
    this._unreachable.set(false);
    return firstValueFrom(
      this.refresh().pipe(
        timeout(10_000),
        tap(() => this._unreachable.set(false)),
        catchError((error: unknown) => {
          this._unreachable.set(!isAuthRejection(error));
          return of(null);
        }),
        map(() => undefined),
      ),
    );
  }

  logout(): Observable<void> {
    return this.http
      .post(`${this.baseUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        catchError(() => of(null)), // sign out locally even if the server call fails
        tap(() => this.clear()),
        map(() => undefined),
      );
  }

  clear(): void {
    this._session.set(null);
    this._unreachable.set(false);
  }
}
