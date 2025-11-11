import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { PlatformStats, UserStats, SportStats, TrendingContent, ComparisonStats } from '../models';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPlatformStats(): Observable<PlatformStats> {
    return this.http.get<PlatformStats>(`${this.apiUrl}/stats/platform`).pipe(
      catchError(this.handleError)
    );
  }

  getUserStats(userId: string): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/stats/user/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  getSportStats(sportId: string): Observable<SportStats> {
    return this.http.get<SportStats>(`${this.apiUrl}/stats/sport/${sportId}`).pipe(
      catchError(this.handleError)
    );
  }

  getTrendingContent(timeframe: '1d' | '7d' | '30d' = '7d', type: 'all' | 'highlights' | 'analyses' = 'all'): Observable<TrendingContent> {
    const params = new URLSearchParams();
    params.append('timeframe', timeframe);
    params.append('type', type);

    return this.http.get<TrendingContent>(`${this.apiUrl}/stats/trending?${params}`).pipe(
      catchError(this.handleError)
    );
  }

  getComparisonStats(userId: string, otherUserId: string): Observable<ComparisonStats> {
    const params = new URLSearchParams();
    params.append('userId', userId);
    params.append('otherUserId', otherUserId);

    return this.http.get<ComparisonStats>(`${this.apiUrl}/stats/compare?${params}`).pipe(
      catchError(this.handleError)
    );
  }

  // Chart data methods
  getUserGrowthData(days: number = 30): Observable<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill: boolean;
    }>;
  }> {
    return this.http.get<any>(`${this.apiUrl}/stats/charts/user-growth?days=${days}`).pipe(
      catchError(this.handleError)
    );
  }

  getContentCreationData(days: number = 30): Observable<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string[];
    }>;
  }> {
    return this.http.get<any>(`${this.apiUrl}/stats/charts/content-creation?days=${days}`).pipe(
      catchError(this.handleError)
    );
  }

  getSportDistributionData(): Observable<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string[];
    }>;
  }> {
    return this.http.get<any>(`${this.apiUrl}/stats/charts/sport-distribution`).pipe(
      catchError(this.handleError)
    );
  }

  getEngagementMetrics(days: number = 30): Observable<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill: boolean;
    }>;
  }> {
    return this.http.get<any>(`${this.apiUrl}/stats/charts/engagement?days=${days}`).pipe(
      catchError(this.handleError)
    );
  }

  getTopPerformers(limit: number = 10, period: 'week' | 'month' | 'year' = 'month'): Observable<{
    creators: Array<{
      id: string;
      name: string;
      imgURL: string;
      highlights: number;
      analyses: number;
      totalViews: number;
      engagement: number;
    }>;
    sports: Array<{
      name: string;
      growth: number;
      highlights: number;
      analyses: number;
    }>;
  }> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('period', period);

    return this.http.get<any>(`${this.apiUrl}/stats/performers?${params}`).pipe(
      catchError(this.handleError)
    );
  }

  exportStats(type: 'platform' | 'user' | 'sport', id?: string, format: 'csv' | 'json' | 'pdf' = 'csv'): Observable<Blob> {
    let url = `${this.apiUrl}/stats/export/${type}`;
    if (id) url += `/${id}`;

    const params = new URLSearchParams();
    params.append('format', format);

    return this.http.get(`${url}?${params}`, {
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Statistics service error:', error);

    let errorMessage = 'An error occurred with statistics service';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message || errorMessage;
    }

    return throwError(() => new Error(errorMessage));
  }
}