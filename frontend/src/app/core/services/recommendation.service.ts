import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { PostRecommendation, UserRecommendation } from '../models/hashtag.model';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = `${environment.apiUrl}/recommendations`;

  constructor(private http: HttpClient) {}

  /**
   * Busca recomendações de posts para o usuário
   */
  getRecommendedPosts(
    userId: string,
    limit: number = 10
  ): Observable<{ recommendations: PostRecommendation[]; count: number }> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('limit', limit.toString());

    return this.http.get<{ recommendations: PostRecommendation[]; count: number }>(
      `${this.apiUrl}/posts`,
      { params }
    );
  }

  /**
   * Busca recomendações de usuários para seguir
   */
  getRecommendedUsers(
    userId: string,
    limit: number = 5
  ): Observable<{ recommendations: UserRecommendation[]; count: number }> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('limit', limit.toString());

    return this.http.get<{ recommendations: UserRecommendation[]; count: number }>(
      `${this.apiUrl}/users`,
      { params }
    );
  }

  /**
   * Segue um usuário
   */
  followUser(followerId: string, userId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/users/${userId}/follow`, { followerId });
  }

  /**
   * Deixa de seguir um usuário
   */
  unfollowUser(followerId: string, userId: string): Observable<any> {
    return this.http.request('delete', `${environment.apiUrl}/users/${userId}/follow`, {
      body: { followerId }
    });
  }
}
