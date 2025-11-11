import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface WorkoutActivity {
  id: string;
  stravaId: string;
  athleteId: string;
  name: string;
  type: string;
  sportType?: string;
  startDate: string;
  endDate?: string;
  distance?: number;
  movingTime?: number;
  elapsedTime?: number;
  averageSpeed?: number;
  maxSpeed?: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
  averageCadence?: number;
  averagePower?: number;
  maxPower?: number;
  elevationGain?: number;
  elevationLoss?: number;
  elevationHigh?: number;
  elevationLow?: number;
  polyline?: string;
  description?: string;
  isPrivate: boolean;
  hasKudo: boolean;
  kudosCount?: number;
  commentCount?: number;
  photoCount?: number;
  lastSyncAt?: string;
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type?: string;
  start_date: string;
  start_date_local: string;
  timezone?: string;
  utc_offset?: number;
  distance?: number;
  moving_time?: number;
  elapsed_time?: number;
  average_speed?: number;
  max_speed?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  average_watts?: number;
  max_watts?: number;
  total_elevation_gain?: number;
  elev_high?: number;
  elev_low?: number;
  map?: {
    summary_polyline?: string;
  };
  description?: string;
  private?: boolean;
  achievement_count?: number;
  kudos_count?: number;
  comment_count?: number;
  athlete_count?: number;
  photo_count?: number;
  trainer?: boolean;
  commute?: boolean;
  manual?: boolean;
}

export interface WorkoutActivitiesResponse {
  activities: WorkoutActivity[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface StravaActivitiesResponse {
  activities: StravaActivity[];
  hasMore: boolean;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class WorkoutActivitiesService {
  private readonly apiUrl = `${environment.apiUrl}/strava`;
  private readonly selectedActivities$ = new BehaviorSubject<string[]>([]);

  readonly selectedActivities$Observable = this.selectedActivities$.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  /**
   * Sincronizar atividades do Strava
   */
  syncStravaActivities(limit: number = 50): Observable<{ message: string; activities: WorkoutActivity[] }> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ message: string; activities: WorkoutActivity[] }>(
      `${this.apiUrl}/sync`,
      { limit },
      { headers }
    );
  }

  /**
   * Obter atividades sincronizadas do usuário
   */
  getUserActivities(limit: number = 10, offset: number = 0): Observable<WorkoutActivitiesResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<WorkoutActivitiesResponse>(
      `${this.apiUrl}/my-activities?limit=${limit}&offset=${offset}`,
      { headers }
    );
  }

  /**
   * Obter atividade específica por ID
   */
  getActivityById(activityId: string): Observable<WorkoutActivity> {
    const headers = this.getAuthHeaders();
    return this.http.get<WorkoutActivity>(
      `${this.apiUrl}/activities/${activityId}`,
      { headers }
    );
  }

  /**
   * Obter múltiplas atividades por IDs (para seleção em posts)
   */
  getActivitiesByIds(activityIds: string[]): Observable<{ activities: WorkoutActivity[]; total: number }> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ activities: WorkoutActivity[]; total: number }>(
      `${this.apiUrl}/activities/batch`,
      { activityIds },
      { headers }
    );
  }

  /**
   * Buscar atividades diretamente da API Strava (sem sincronizar)
   */
  getStravaActivities(
    page: number = 1,
    perPage: number = 30,
    before?: Date,
    after?: Date
  ): Observable<StravaActivitiesResponse> {
    const headers = this.getAuthHeaders();
    let url = `${this.apiUrl}/strava-activities?page=${page}&per_page=${perPage}`;

    if (before) {
      url += `&before=${before.getTime()}`;
    }

    if (after) {
      url += `&after=${after.getTime()}`;
    }

    return this.http.get<StravaActivitiesResponse>(url, { headers });
  }

  /**
   * Adicionar atividade à seleção
   */
  addActivityToSelection(activityId: string): void {
    const currentSelection = this.selectedActivities$.value;
    if (!currentSelection.includes(activityId)) {
      this.selectedActivities$.next([...currentSelection, activityId]);
    }
  }

  /**
   * Remover atividade da seleção
   */
  removeActivityFromSelection(activityId: string): void {
    const currentSelection = this.selectedActivities$.value;
    this.selectedActivities$.next(currentSelection.filter(id => id !== activityId));
  }

  /**
   * Limpar seleção de atividades
   */
  clearActivitySelection(): void {
    this.selectedActivities$.next([]);
  }

  /**
   * Obter atividades selecionadas
   */
  getSelectedActivities(): string[] {
    return this.selectedActivities$.value;
  }

  /**
   * Verificar se atividade está selecionada
   */
  isActivitySelected(activityId: string): boolean {
    return this.selectedActivities$.value.includes(activityId);
  }

  /**
   * Obter atividades selecionadas com detalhes
   */
  getSelectedActivitiesDetails(): Observable<WorkoutActivity[]> {
    const selectedIds = this.selectedActivities$.value;
    if (selectedIds.length === 0) {
      return of([]);
    }

    return this.getActivitiesByIds(selectedIds).pipe(
      map(response => response.activities)
    );
  }

  /**
   * Formatar duração em segundos para string legível
   */
  formatDuration(seconds?: number): string {
    if (!seconds) return '';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Formatar distância em metros para string legível
   */
  formatDistance(meters?: number): string {
    if (!meters) return '';

    // Converter para número se vier como string
    const numericMeters = typeof meters === 'string' ? parseFloat(meters) : meters;
    
    if (isNaN(numericMeters)) return '';

    if (numericMeters >= 1000) {
      return `${(numericMeters / 1000).toFixed(2)} km`;
    } else {
      return `${numericMeters.toFixed(0)} m`;
    }
  }

  /**
   * Formatar velocidade em m/s para km/h
   */
  formatSpeed(speedMs?: number): string {
    if (!speedMs) return '';

    // Converter para número se vier como string
    const numericSpeed = typeof speedMs === 'string' ? parseFloat(speedMs) : speedMs;
    
    if (isNaN(numericSpeed)) return '';

    const speedKmh = numericSpeed * 3.6;
    return `${speedKmh.toFixed(1)} km/h`;
  }

  /**
   * Formatar elevação em metros para string legível
   */
  formatElevation(meters?: number): string {
    if (meters === undefined || meters === null) return '';

    // Converter para número se vier como string
    const numericMeters = typeof meters === 'string' ? parseFloat(meters) : meters;
    
    if (isNaN(numericMeters)) return '';

    if (numericMeters >= 1000) {
      return `${(numericMeters / 1000).toFixed(2)} km`;
    }

    return `${numericMeters.toFixed(0)} m`;
  }

  /**
   * Formatar data para string legível
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoje';
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  }

  /**
   * Obter headers de autenticação
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.token;

    if (!token) {
      throw new Error('Usuário não autenticado. Faça login para continuar.');
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}