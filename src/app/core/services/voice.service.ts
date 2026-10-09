// SERVICE — admin view of what clients said to the voice assistant

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Pagination } from '../models/chat.model';

export interface VoiceRecording {
  id: number;
  user_id: number;
  audio_url: string;
  duration_seconds: number | null;
  size_bytes: number | null;
  status: 'transcribed' | 'failed';
  transcript: string | null;
  final_text: string | null;
  language: string | null;
  chat_session_id: number | null;
  created_at: string;
  user?: { id: number; name: string; phone: string };
}

export interface VoiceResponse {
  success: boolean;
  pagination: Pagination;
  data: VoiceRecording[];
}

export interface VoiceFilters {
  q?: string;
  from?: string;
  to?: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class VoiceService {
  private base = `${environment.apiUrl}/voice`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  list(page = 1, limit = 20, filters: VoiceFilters = {}): Observable<VoiceResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    for (const [k, v] of Object.entries(filters)) if (v) params = params.set(k, v);
    return this.http.get<VoiceResponse>(this.base, { headers: this.headers(), params });
  }

  remove(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.base}/${id}`, { headers: this.headers() });
  }
}
