import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timer, switchMap, retry, share, tap, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Notification {
  id: string;
  type: 'mention' | 'like' | 'comment' | 'follow' | 'repost';
  actor: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  post?: {
    id: string;
    content: string;
  };
  read: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private pollingInterval = 60000; // 1 minute

  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.startPolling();
  }

  private startPolling() {
    timer(0, this.pollingInterval).pipe(
      switchMap(() => this.fetchNotifications()),
      retry(),
      share()
    ).subscribe();
  }

  fetchNotifications(page: number = 1): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`${this.apiUrl}?page=${page}`).pipe(
      tap(response => {
        if (page === 1) {
          this.notificationsSubject.next(response.notifications);
          this.unreadCountSubject.next(response.unreadCount);
        }
      }),
      catchError(error => {
        console.error('Error fetching notifications', error);
        return of({ notifications: [], unreadCount: 0, pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
      })
    );
  }

  markAsRead(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        const currentNotifications = this.notificationsSubject.value;
        const updatedNotifications = currentNotifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        );
        this.notificationsSubject.next(updatedNotifications);
        
        // Update unread count locally
        const currentCount = this.unreadCountSubject.value;
        if (currentCount > 0) {
          this.unreadCountSubject.next(currentCount - 1);
        }
      })
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        const currentNotifications = this.notificationsSubject.value;
        const updatedNotifications = currentNotifications.map(n => ({ ...n, read: true }));
        this.notificationsSubject.next(updatedNotifications);
        this.unreadCountSubject.next(0);
      })
    );
  }
}
