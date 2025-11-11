import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import type {
  CommentResponse,
  FeedResponse,
  LikeResponse,
  PostResponse,
  PublicPost
} from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly postsUrl = `${environment.apiUrl}/posts`;
  private readonly likesUrl = `${environment.apiUrl}/likes`;
  private readonly followersUrl = `${environment.apiUrl}/followers`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  loadFeed(): Observable<PublicPost[]> {
    return this.http.get<FeedResponse>(this.postsUrl).pipe(map(response => response.posts));
  }

  getUserPosts(userId: string): Observable<PublicPost[]> {
    return this.http
      .get<FeedResponse>(`${this.postsUrl}/user/${userId}`)
      .pipe(map(response => response.posts));
  }

  createPost(payload: { content: string; parentId?: string | null; workoutActivityIds?: string[] }): Observable<PublicPost> {
    const { content, parentId = null, workoutActivityIds } = payload;
    const authorId = this.authService.currentUser?.id;

    console.log('[PostsService.createPost] Current user:', this.authService.currentUser);
    console.log('[PostsService.createPost] Author ID:', authorId);

    if (!authorId) {
      console.error('[PostsService.createPost] No author ID - user not authenticated');
      return throwError(() => new Error('É necessário estar autenticado para publicar.'));
    }

    const body: Record<string, unknown> = {
      authorId,
      content,
      parentId
    };

    if (workoutActivityIds && workoutActivityIds.length > 0) {
      body['workoutActivityIds'] = workoutActivityIds;
    }

    console.log('[PostsService.createPost] Sending request body:', body);

    return this.http
      .post<PostResponse>(this.postsUrl, body)
      .pipe(map(response => response.post));
  }

  likePost(postId: string): Observable<PublicPost> {
    const userId = this.authService.currentUser?.id;

    if (!userId) {
      return throwError(() => new Error('É necessário estar autenticado para curtir.'));
    }

    return this.http.post<LikeResponse>(this.likesUrl, { userId, postId }).pipe(
      map(response => {
        if (!response.post) {
          throw new Error('Resposta inválida ao curtir publicação.');
        }
        return response.post;
      })
    );
  }

  commentOnPost(postId: string, content: string): Observable<PublicPost> {
    const authorId = this.authService.currentUser?.id;

    if (!authorId) {
      return throwError(() => new Error('É necessário estar autenticado para comentar.'));
    }

    return this.http
      .post<CommentResponse>(`${this.postsUrl}/${postId}/comments`, { authorId, content })
      .pipe(
        map(response => {
          if (!response.post) {
            throw new Error('Resposta inválida ao comentar publicação.');
          }
          return response.post;
        })
      );
  }

  repost(postId: string): Observable<PublicPost> {
    const userId = this.authService.currentUser?.id;

    if (!userId) {
      return throwError(() => new Error('É necessário estar autenticado para republicar.'));
    }

    return this.http
      .post<PostResponse>(`${this.postsUrl}/${postId}/repost`, { userId })
      .pipe(map(response => response.post));
  }

  followUser(followedId: string): Observable<string> {
    const followerId = this.authService.currentUser?.id;

    if (!followerId) {
      return throwError(() => new Error('É necessário estar autenticado para seguir alguém.'));
    }

    return this.http
      .post<{ message: string }>(this.followersUrl, { followerId, followedId })
      .pipe(map(response => response.message));
  }
}
