import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StravaConnection {
  isConnected: boolean;
  athleteId?: string;
  expiresAt?: Date;
}

type StravaTokenPayload = {
  expires_at?: number;
  athlete?: {
    id?: number;
  };
};

type StoredStravaToken = {
  id: string;
  providerUserId: string;
  accessTokenExpiresAt?: string;
};

type StravaAuthCallbackResponse = {
  tokens: StravaTokenPayload;
  stored?: StoredStravaToken;
};

type StravaStatePayload = {
  returnTo?: string;
};

@Injectable({ providedIn: 'root' })
export class StravaService {
  private readonly authApiUrl = `${environment.apiUrl}/auth`;
  private readonly storageKey = 'esportz.strava';
  private readonly connection$ = new BehaviorSubject<StravaConnection>(this.restoreFromStorage());
  private readonly stravaAuthorizeUrl = 'https://www.strava.com/oauth/authorize';
  private readonly stravaScope = environment.strava?.scope ?? 'read,activity:read_all,profile:read_all';

  readonly stravaConnection$ = this.connection$.asObservable();

  constructor(private readonly http: HttpClient) {
    this.setupMessageListener();
  }

  get isConnected(): boolean {
    return this.connection$.value.isConnected;
  }

  get athleteId(): string | undefined {
    return this.connection$.value.athleteId;
  }

  connectToStrava(returnTo?: string): void {
    if (typeof window === 'undefined') {
      console.warn('Strava authentication is only available in the browser environment.');
      return;
    }

    const clientId = environment.strava?.clientId;
    const redirectUri = this.getRedirectUri();
    console.log(redirectUri)
    if (!clientId || !redirectUri) {
      console.error('Strava client id or redirect URI is not configured.');
      return;
    }

    const authorizeUrl = new URL(this.stravaAuthorizeUrl);
    authorizeUrl.searchParams.set('client_id', clientId);
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('redirect_uri', redirectUri);
    authorizeUrl.searchParams.set('approval_prompt', 'force');
    authorizeUrl.searchParams.set('scope', this.stravaScope);

    const state = this.buildState(returnTo);
    if (state) {
      authorizeUrl.searchParams.set('state', state);
    }

    // Abrir popup para OAuth
    this.openStravaPopup(authorizeUrl.toString());
  }

  private openStravaPopup(url: string): void {
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      url,
      'Strava Authorization',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      console.error('Popup bloqueado. Por favor, permita popups para este site.');
      // Fallback: redirecionar a página inteira
      window.location.href = url;
      return;
    }

    // Focar no popup
    popup.focus();

    // Listener para quando o popup fechar ou completar o OAuth
    // Usar try-catch para evitar erros de COOP
    const checkPopup = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(checkPopup);
          console.log('Popup do Strava fechado');
          
          // Verificar se a conexão foi estabelecida
          const currentConnection = this.restoreFromStorage();
          if (currentConnection.isConnected) {
            // Emitir evento de sucesso
            this.connection$.next(currentConnection);
          }
        }
      } catch (error) {
        // Erro de COOP - popup ainda aberto mas em domínio diferente
        // Ignorar silenciosamente
      }
    }, 500);
  }

  exchangeAuthorizationCode(code: string): Observable<StravaConnection> {
    return this.http
      .get<StravaAuthCallbackResponse>(`${this.authApiUrl}/callback`, { params: { code } })
      .pipe(
        map(response => {
          const connection = this.normalizeConnection({
            isConnected: true,
            athleteId: response.stored?.providerUserId ?? this.extractAthleteId(response.tokens),
            expiresAt: this.extractExpiration(response)
          });

          this.setConnection(connection);
          return connection;
        })
      );
  }

  getReturnPathFromState(stateParam: string | null): string | undefined {
    if (!stateParam) {
      return undefined;
    }

    try {
      const decoded = JSON.parse(atob(decodeURIComponent(stateParam))) as StravaStatePayload;
      const returnTo = decoded?.returnTo;
      return typeof returnTo === 'string' && returnTo.trim().length > 0 ? returnTo : undefined;
    } catch (error) {
      console.warn('Failed to parse Strava state payload', error);
      return undefined;
    }
  }

  setConnection(data: StravaConnection): void {
    const normalized = this.normalizeConnection(data);

    if (typeof window !== 'undefined') {
      const serialized = {
        ...normalized,
        expiresAt: normalized.expiresAt?.toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(serialized));
    }

    this.connection$.next(normalized);
  }

  disconnect(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
    this.connection$.next({ isConnected: false });
  }

  private buildState(returnTo?: string): string | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const payload: StravaStatePayload = {
      returnTo: returnTo ?? this.defaultReturnTo()
    };

    try {
      return btoa(JSON.stringify(payload));
    } catch (error) {
      console.warn('Failed to encode Strava state payload', error);
      return undefined;
    }
  }

  private defaultReturnTo(): string {
    if (typeof window === 'undefined') {
      return '/';
    }
    return window.location.pathname + window.location.search;
  }

  private getRedirectUri(): string | undefined {
    if (environment.strava?.redirectUri) {
      return environment.strava.redirectUri;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    return `${window.location.origin}/auth/strava/callback`;
  }

  private restoreFromStorage(): StravaConnection {
    if (typeof window === 'undefined') {
      return { isConnected: false };
    }
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return { isConnected: false };
      }

      const parsed = JSON.parse(raw) as Partial<StravaConnection> & { expiresAt?: string };
      return this.normalizeConnection(parsed);
    } catch (error) {
      console.warn('Failed to restore Strava connection from storage', error);
      return { isConnected: false };
    }
  }

  private normalizeConnection(data?: Partial<StravaConnection> & { expiresAt?: string | Date }): StravaConnection {
    if (!data) {
      return { isConnected: false };
    }

    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : undefined;

    return {
      isConnected: Boolean(data.isConnected),
      athleteId: data.athleteId,
      expiresAt: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : undefined
    };
  }

  private extractAthleteId(tokens: StravaTokenPayload): string | undefined {
    const athleteId = tokens?.athlete?.id;
    return typeof athleteId === 'number' ? String(athleteId) : undefined;
  }

  private extractExpiration(response: StravaAuthCallbackResponse): Date | undefined {
    const expiresFromStorage = response.stored?.accessTokenExpiresAt;
    if (expiresFromStorage) {
      const expiration = new Date(expiresFromStorage);
      return Number.isNaN(expiration.getTime()) ? undefined : expiration;
    }

    const expiresAtSeconds = response.tokens?.expires_at;
    if (typeof expiresAtSeconds === 'number') {
      const expiration = new Date(expiresAtSeconds * 1000);
      return Number.isNaN(expiration.getTime()) ? undefined : expiration;
    }

    return undefined;
  }

  private setupMessageListener(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('message', (event: MessageEvent) => {
      // Verificar origem por segurança
      if (event.origin !== window.location.origin) {
        return;
      }

      // Verificar se é mensagem do OAuth do Strava
      if (event.data?.type === 'STRAVA_AUTH_SUCCESS') {
        console.log('Recebida confirmação de autenticação do Strava via popup');
        
        // Recarregar conexão do storage (já foi salva pelo callback)
        const currentConnection = this.restoreFromStorage();
        this.connection$.next(currentConnection);
      }
    });
  }
}

