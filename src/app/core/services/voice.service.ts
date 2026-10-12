// SERVICE — admin voice messages API calls

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VoiceMessagesResponse } from '../models/voice.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class VoiceService {
  private base = `${environment.apiUrl}/voice/admin`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getMessages(
    page  = 1,
    limit = 20,
    filters?: { status?: string },
  ): Observable<VoiceMessagesResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (filters?.status) params = params.set('status', filters.status);
    return this.http.get<VoiceMessagesResponse>(this.base, { headers: this.headers(), params });
  }
}
