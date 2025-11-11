import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { TacticalAnalysis, TacticalAnalysisInput, TacticalComment, TacticalCommentInput } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TacticalService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTacticalAnalyses(sport?: string, author?: string, featured?: boolean, limit?: number, offset?: number): Observable<{
    analyses: TacticalAnalysis[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  }> {
    const params = new URLSearchParams();

    if (sport) params.append('sport', sport);
    if (author) params.append('author', author);
    if (featured !== undefined) params.append('featured', featured.toString());
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const url = params.toString()
      ? `${this.apiUrl}/tactical?${params}`
      : `${this.apiUrl}/tactical`;

    return this.http.get<any>(url).pipe(
      catchError(this.handleError)
    );
  }

  getTacticalAnalysisById(id: string): Observable<TacticalAnalysis> {
    return this.http.get<TacticalAnalysis>(`${this.apiUrl}/tactical/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createTacticalAnalysis(analysisData: TacticalAnalysisInput): Observable<TacticalAnalysis> {
    return this.http.post<TacticalAnalysis>(`${this.apiUrl}/tactical`, analysisData).pipe(
      catchError(this.handleError)
    );
  }

  updateTacticalAnalysis(id: string, analysisData: Partial<TacticalAnalysisInput>): Observable<TacticalAnalysis> {
    return this.http.put<TacticalAnalysis>(`${this.apiUrl}/tactical/${id}`, analysisData).pipe(
      catchError(this.handleError)
    );
  }

  deleteTacticalAnalysis(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tactical/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  toggleLikeAnalysis(id: string): Observable<{ liked: boolean; likes: number }> {
    return this.http.post<{ liked: boolean; likes: number }>(`${this.apiUrl}/tactical/${id}/like`, {}).pipe(
      catchError(this.handleError)
    );
  }

  addComment(analysisId: string, commentData: TacticalCommentInput): Observable<TacticalComment> {
    return this.http.post<TacticalComment>(`${this.apiUrl}/tactical/${analysisId}/comments`, commentData).pipe(
      catchError(this.handleError)
    );
  }

  getComments(analysisId: string, limit?: number, offset?: number): Observable<TacticalComment[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const url = params.toString()
      ? `${this.apiUrl}/tactical/${analysisId}/comments?${params}`
      : `${this.apiUrl}/tactical/${analysisId}/comments`;

    return this.http.get<TacticalComment[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  getUserTacticalAnalyses(userId: string, limit?: number, offset?: number): Observable<TacticalAnalysis[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const url = params.toString()
      ? `${this.apiUrl}/tactical/user/${userId}?${params}`
      : `${this.apiUrl}/tactical/user/${userId}`;

    return this.http.get<TacticalAnalysis[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  searchTacticalAnalyses(query: string, sport?: string, limit?: number, offset?: number): Observable<{
    analyses: TacticalAnalysis[];
    total: number;
    query: string;
    hasMore: boolean;
  }> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (sport) params.append('sport', sport);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    return this.http.get<any>(`${this.apiUrl}/tactical/search?${params}`).pipe(
      catchError(this.handleError)
    );
  }

  // Tactical board specific methods
  generateFormation(sport: string, formation: string[]): Observable<{
    home: { formation: string[]; positions: Array<{ x: number; y: number; player?: string; role?: string }> };
    away: { formation: string[]; positions: Array<{ x: number; y: number; player?: string; role?: string }> };
  }> {
    return this.http.post<any>(`${this.apiUrl}/tactical/formation-generator`, {
      sport,
      formation
    }).pipe(
      catchError(this.handleError)
    );
  }

  analyzePattern(pattern: any): Observable<{
    insights: string;
    effectiveness: number;
    recommendations: string[];
  }> {
    return this.http.post<any>(`${this.apiUrl}/tactical/pattern-analyzer`, pattern).pipe(
      catchError(this.handleError)
    );
  }

  exportAnalysis(analysisId: string, format: 'pdf' | 'png' | 'svg'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/tactical/${analysisId}/export?format=${format}`, {
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Tactical service error:', error);

    let errorMessage = 'An error occurred with tactical analysis service';

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