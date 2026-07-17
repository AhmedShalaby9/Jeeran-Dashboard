import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import {
  NotificationListResponse,
  UserNotificationListResponse,
  SendNotificationDto,
  SendNotificationResponse,
  UnreadCountResponse,
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
    return this.http.get<NotificationListResponse>(this.url, { headers: this.headers(), params });
  }

  // Admin: send a notification
  send(dto: SendNotificationDto): Observable<SendNotificationResponse> {
    return this.http.post<SendNotificationResponse>(`${this.url}/send`, dto, { headers: this.headers() });
  }

  // Register browser FCM token with backend
  registerDeviceToken(fcm_token: string): Observable<unknown> {
    return this.http.post(`${this.url}/device-token`, { fcm_token }, { headers: this.headers() });
  }

  // Admin inbox: my notifications
  getMine(page = 1, limit = 20, is_read?: boolean): Observable<UserNotificationListResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (is_read !== undefined) params = params.set('is_read', String(is_read));
    return this.http.get<UserNotificationListResponse>(`${this.url}/mine`, { headers: this.headers(), params });
  }

  // Admin inbox: unread count
  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(`${this.url}/mine/unread-count`, { headers: this.headers() });
  }

  // Mark one as read (id = user_notification row id)
  markRead(id: number): Observable<unknown> {
    return this.http.patch(`${this.url}/mine/${id}/read`, {}, { headers: this.headers() });
  }

  // Mark all as read
  markAllRead(): Observable<unknown> {
    return this.http.patch(`${this.url}/mine/read-all`, {}, { headers: this.headers() });
  }
}
