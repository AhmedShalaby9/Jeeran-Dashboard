// SERVICE — admin chat API calls

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatSessionsResponse, ChatMessagesResponse } from '../models/chat.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private base = `${environment.apiUrl}/chat/admin`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getSessions(
    page       = 1,
    limit      = 20,
    filters?: { date_from?: string; date_to?: string; date_field?: string },
  ): Observable<ChatSessionsResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (filters?.date_from)  params = params.set('date_from',  filters.date_from);
    if (filters?.date_to)    params = params.set('date_to',    filters.date_to);
    if (filters?.date_field) params = params.set('date_field', filters.date_field);
    return this.http.get<ChatSessionsResponse>(`${this.base}/sessions`, {
      headers: this.headers(), params,
    });
  }

  getMessages(sessionId: number, page = 1, limit = 30): Observable<ChatMessagesResponse> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<ChatMessagesResponse>(
      `${this.base}/sessions/${sessionId}/messages`,
      { headers: this.headers(), params },
    );
  }
}
