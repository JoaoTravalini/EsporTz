import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthSuccessResponse, AuthUser } from '../models/auth.model';

type AuthState = {
  user: AuthUser;
  token: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  imgURL?: string | null;
  provider?: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly storageKey = 'esportz.auth';
  private readonly state$ = new BehaviorSubject<AuthState | null>(this.restoreFromStorage());

  readonly user$ = this.state$.asObservable();

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginPayload): Observable<AuthSuccessResponse> {
    return this.http
      .post<AuthSuccessResponse>(`${this.apiUrl}/login`, payload)
      .pipe(tap(response => this.persist(response)));
  }

  register(payload: RegisterPayload): Observable<AuthSuccessResponse> {
    return this.http
      .post<AuthSuccessResponse>(`${this.apiUrl}/register`, payload)
      .pipe(tap(response => this.persist(response)));
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
    this.state$.next(null);
  }

  get token(): string | null {
    return this.state$.value?.token ?? null;
  }

  get currentUser(): AuthUser | null {
    return this.state$.value?.user ?? null;
  }

  private persist(response: AuthSuccessResponse): void {
    const state: AuthState = {
      user: response.user,
      token: response.token
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    }
    this.state$.next(state);
  }

  private restoreFromStorage(): AuthState | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const raw = localStorage.getItem(this.storageKey);
      const state = raw ? (JSON.parse(raw) as AuthState) : null;
      console.log('[AuthService] Restored from storage:', !!state, 'Token exists:', !!state?.token);
      return state;
    } catch (error) {
      console.warn('Failed to restore auth state from storage', error);
      return null;
    }
  }
}
