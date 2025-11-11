import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Hashtag, TrendingHashtag } from '../models/hashtag.model';

@Injectable({
  providedIn: 'root'
})
export class HashtagService {
  private apiUrl = `${environment.apiUrl}/hashtags`;

  constructor(private http: HttpClient) {}

  /**
   * Busca hashtags por padrão (para autocomplete)
   */
  searchHashtags(query: string, limit: number = 10): Observable<{ hashtags: Hashtag[] }> {
    const params = new HttpParams()
      .set('q', query)
      .set('limit', limit.toString());

    return this.http.get<{ hashtags: Hashtag[] }>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Busca posts por hashtag
   */
  getPostsByHashtag(tag: string, limit: number = 20, offset: number = 0): Observable<any> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get(`${this.apiUrl}/${tag}/posts`, { params });
  }

  /**
   * Retorna hashtags em alta
   */
  getTrendingHashtags(
    timeWindow: '1h' | '24h' | '7d' = '24h',
    limit: number = 10
  ): Observable<{ trending: TrendingHashtag[]; timeWindow: string; count: number }> {
    const params = new HttpParams()
      .set('window', timeWindow)
      .set('limit', limit.toString());

    return this.http.get<{ trending: TrendingHashtag[]; timeWindow: string; count: number }>(
      `${this.apiUrl}/trending`,
      { params }
    );
  }
}
