import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { Sport, Team, Match } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SportsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSports(): Observable<Sport[]> {
    return this.http.get<Sport[]>(`${this.apiUrl}/sports`).pipe(
      catchError(this.handleError)
    );
  }

  getSportById(id: string): Observable<Sport> {
    return this.http.get<Sport>(`${this.apiUrl}/sports/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createSport(sportData: Partial<Sport>): Observable<Sport> {
    return this.http.post<Sport>(`${this.apiUrl}/sports`, sportData).pipe(
      catchError(this.handleError)
    );
  }

  updateSport(id: string, sportData: Partial<Sport>): Observable<Sport> {
    return this.http.put<Sport>(`${this.apiUrl}/sports/${id}`, sportData).pipe(
      catchError(this.handleError)
    );
  }

  getTeams(sportId?: string): Observable<Team[]> {
    const url = sportId ? `${this.apiUrl}/teams?sport=${sportId}` : `${this.apiUrl}/teams`;
    return this.http.get<Team[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  getTeamById(id: string): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/teams/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createTeam(teamData: Partial<Team>): Observable<Team> {
    return this.http.post<Team>(`${this.apiUrl}/teams`, teamData).pipe(
      catchError(this.handleError)
    );
  }

  updateTeam(id: string, teamData: Partial<Team>): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}/teams/${id}`, teamData).pipe(
      catchError(this.handleError)
    );
  }

  getMatches(sportId?: string, teamId?: string, status?: string, limit?: number, offset?: number): Observable<{
    matches: Match[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  }> {
    const params = new URLSearchParams();
    if (sportId) params.append('sport', sportId);
    if (teamId) params.append('team', teamId);
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const url = params.toString() ? `${this.apiUrl}/matches?${params}` : `${this.apiUrl}/matches`;

    return this.http.get<any>(url).pipe(
      catchError(this.handleError)
    );
  }

  getMatchById(id: string): Observable<Match> {
    return this.http.get<Match>(`${this.apiUrl}/matches/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createMatch(matchData: Partial<Match>): Observable<Match> {
    return this.http.post<Match>(`${this.apiUrl}/matches`, matchData).pipe(
      catchError(this.handleError)
    );
  }

  updateMatch(id: string, matchData: Partial<Match>): Observable<Match> {
    return this.http.put<Match>(`${this.apiUrl}/matches/${id}`, matchData).pipe(
      catchError(this.handleError)
    );
  }

  toggleFollowMatch(matchId: string): Observable<{ following: boolean }> {
    return this.http.post<{ following: boolean }>(`${this.apiUrl}/matches/${matchId}/follow`, {}).pipe(
      catchError(this.handleError)
    );
  }

  toggleFavoriteTeam(teamId: string): Observable<{ favorite: boolean }> {
    return this.http.post<{ favorite: boolean }>(`${this.apiUrl}/teams/${teamId}/favorite`, {}).pipe(
      catchError(this.handleError)
    );
  }

  getUpcomingMatches(sportId?: string, limit?: number): Observable<Match[]> {
    const params = new URLSearchParams();
    if (sportId) params.append('sport', sportId);
    if (limit) params.append('limit', limit.toString());

    const url = params.toString()
      ? `${this.apiUrl}/matches/upcoming?${params}`
      : `${this.apiUrl}/matches/upcoming`;

    return this.http.get<Match[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  getLiveMatches(sportId?: string): Observable<Match[]> {
    const params = new URLSearchParams();
    if (sportId) params.append('sport', sportId);

    const url = params.toString()
      ? `${this.apiUrl}/matches/live?${params}`
      : `${this.apiUrl}/matches/live`;

    return this.http.get<Match[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  getMatchEvents(matchId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/matches/${matchId}/events`).pipe(
      catchError(this.handleError)
    );
  }

  addMatchEvent(matchId: string, eventData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/matches/${matchId}/events`, eventData).pipe(
      catchError(this.handleError)
    );
  }

  // Search methods
  searchSports(query: string): Observable<Sport[]> {
    return this.http.get<Sport[]>(`${this.apiUrl}/sports/search?q=${encodeURIComponent(query)}`).pipe(
      catchError(this.handleError)
    );
  }

  searchTeams(query: string, sportId?: string): Observable<Team[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (sportId) params.append('sport', sportId);

    return this.http.get<Team[]>(`${this.apiUrl}/teams/search?${params}`).pipe(
      catchError(this.handleError)
    );
  }

  searchMatches(query: string, sportId?: string): Observable<Match[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (sportId) params.append('sport', sportId);

    return this.http.get<Match[]>(`${this.apiUrl}/matches/search?${params}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Sports service error:', error);

    let errorMessage = 'An error occurred with sports service';

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