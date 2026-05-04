import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import {
  Notification,
  NotificationListResponse,
  SendNotificationDto,
  SendNotificationResponse,
} from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private url = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  // Admin: list all sent notifications
  getAll(page = 1, limit = 20): Observable<NotificationListResponse> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<NotificationListResponse>(`${this.url}/admin`, {
      headers: this.headers(), params,
    });
  }

  // Admin: send a notification
  send(dto: SendNotificationDto): Observable<SendNotificationResponse> {
    return this.http.post<SendNotificationResponse>(this.url, dto, { headers: this.headers() });
  }

  // User: my notifications
  getMine(page = 1, limit = 20): Observable<NotificationListResponse> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<NotificationListResponse>(this.url, {
      headers: this.headers(), params,
    });
  }

  // User: unread count
  getUnreadCount(): Observable<{ success: boolean; data: { count: number } }> {
    return this.http.get<{ success: boolean; data: { count: number } }>(
      `${this.url}/unread-count`, { headers: this.headers() },
    );
  }

  // User: mark one as read
  markRead(id: number): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(`${this.url}/${id}/read`, {}, { headers: this.headers() });
  }

  // User: mark all as read
  markAllRead(): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(`${this.url}/read-all`, {}, { headers: this.headers() });
  }
}
