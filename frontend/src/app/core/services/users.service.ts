import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, throwError, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import type { PublicUser } from '../models/post.model';
import type { User } from '../models/user.model';

interface SuggestionsResponse {
  suggestions: PublicUser[];
  count: number;
}

interface UserProfileResponse {
  user: User;
}

interface PreferencesFormData {
  favoriteSports?: string[];
  notifications?: {
    highlights?: boolean;
    analyses?: boolean;
    matches?: boolean;
    followedTeams?: boolean;
  };
  privacy?: {
    profilePublic?: boolean;
    showStats?: boolean;
    allowAnalysisSharing?: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly usersUrl = `${environment.apiUrl}/users`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  getSuggestions(limit: number = 5): Observable<PublicUser[]> {
    const userId = this.authService.currentUser?.id;

    if (!userId) {
      return throwError(() => new Error('É necessário estar autenticado para ver sugestões.'));
    }

    return this.http
      .get<SuggestionsResponse>(`${this.usersUrl}/suggestions/${userId}`, {
        params: { limit: limit.toString() }
      })
      .pipe(map(response => response.suggestions));
  }

  searchUsers(query: string): Observable<PublicUser[]> {
    return this.http
      .get<{ users: PublicUser[] }>(`${this.usersUrl}/search`, {
        params: { q: query }
      })
      .pipe(map(response => response.users));
  }

  getUserProfile(userId: string): Observable<User> {
    console.log(this.usersUrl)
    return this.http
      .get<UserProfileResponse>(`${this.usersUrl}/${userId}`)
      .pipe(
        map(response => response.user),
        catchError(error => {
          console.error('Error fetching user profile:', error);
          return throwError(() => new Error('Não foi possível carregar o perfil do usuário.'));
        })
      );
  }

  updateUserProfile(userId: string, data: {
    name?: string;
    bio?: string;
    location?: string;
    website?: string;
    imgURL?: string;
  }): Observable<User> {
    return this.http
      .put<UserProfileResponse>(`${this.usersUrl}/${userId}`, data)
      .pipe(
        map(response => response.user),
        catchError(error => {
          console.error('Error updating user profile:', error);
          return throwError(() => error);
        })
      );
  }

  updateUserPreferences(userId: string, preferences: PreferencesFormData): Observable<User> {
    return this.http
      .put<UserProfileResponse>(`${this.usersUrl}/${userId}/preferences`, { preferences })
      .pipe(
        map(response => response.user),
        catchError(error => {
          console.error('Error updating user preferences:', error);
          return throwError(() => error);
        })
      );
  }
}

