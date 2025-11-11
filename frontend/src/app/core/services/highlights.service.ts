import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, filter } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { Highlight, HighlightInput, HighlightFilters, HighlightSearchResult } from '../models';

@Injectable({
  providedIn: 'root'
})
export class HighlightsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getHighlights(filters?: HighlightFilters): Observable<HighlightSearchResult> {
    const params = new URLSearchParams();

    if (filters?.sport) params.append('sport', filters.sport);
    if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.order) params.append('order', filters.order);

    const url = params.toString() ? `${this.apiUrl}/highlights?${params}` : `${this.apiUrl}/highlights`;

    return this.http.get<HighlightSearchResult>(url).pipe(
      catchError(this.handleError)
    );
  }

  getHighlightById(id: string): Observable<Highlight> {
    return this.http.get<Highlight>(`${this.apiUrl}/highlights/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createHighlight(highlightData: HighlightInput, files?: { video?: File, image?: File }): Observable<Highlight> {
    const formData = new FormData();

    // Add form fields
    Object.keys(highlightData).forEach(key => {
      const value = highlightData[key as keyof HighlightInput];
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add files
    if (files?.video) {
      formData.append('video', files.video);
    }
    if (files?.image) {
      formData.append('image', files.image);
    }

    return this.http.post<Highlight>(`${this.apiUrl}/highlights`, formData).pipe(
      catchError(this.handleError)
    );
  }

  updateHighlight(id: string, highlightData: Partial<HighlightInput>): Observable<Highlight> {
    return this.http.put<Highlight>(`${this.apiUrl}/highlights/${id}`, highlightData).pipe(
      catchError(this.handleError)
    );
  }

  deleteHighlight(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/highlights/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  toggleLikeHighlight(id: string): Observable<{ liked: boolean; likes: number }> {
    return this.http.post<{ liked: boolean; likes: number }>(`${this.apiUrl}/highlights/${id}/like`, {}).pipe(
      catchError(this.handleError)
    );
  }

  getUserHighlights(userId: string, limit?: number, offset?: number): Observable<Highlight[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const url = params.toString()
      ? `${this.apiUrl}/highlights/user/${userId}?${params}`
      : `${this.apiUrl}/highlights/user/${userId}`;

    return this.http.get<Highlight[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  getFeaturedHighlights(sport?: string, limit?: number): Observable<Highlight[]> {
    const params = new URLSearchParams();
    if (sport) params.append('sport', sport);
    if (limit) params.append('limit', limit.toString());

    const url = params.toString()
      ? `${this.apiUrl}/highlights/featured?${params}`
      : `${this.apiUrl}/highlights/featured`;

    return this.http.get<Highlight[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  searchHighlights(query: string, sport?: string, limit?: number, offset?: number): Observable<HighlightSearchResult> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (sport) params.append('sport', sport);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    return this.http.get<HighlightSearchResult>(`${this.apiUrl}/highlights/search?${params}`).pipe(
      catchError(this.handleError)
    );
  }

  uploadMedia(file: File, type: 'video' | 'image', onProgress?: (progress: number) => void): Observable<{ url: string; publicId: string; thumbnail?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const req = new HttpRequest('POST', `${this.apiUrl}/media/upload`, formData, {
      reportProgress: true
    });

    return this.http.request(req).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = Math.round(100 * event.loaded / event.total!);
          if (onProgress) onProgress(progress);
        } else if (event.type === HttpEventType.Response) {
          return event.body as { url: string; publicId: string; thumbnail?: string };
        }
        return null;
      }),
      filter(result => result !== null),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Highlights service error:', error);

    let errorMessage = 'An error occurred with highlights service';

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