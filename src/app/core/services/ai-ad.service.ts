import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AiAdsResponse } from '../models/ai-ad.model';
import { AuthService } from './auth.service';

export interface AiAdFilters {
  status?: string;
  payment_status?: string;
  user_id?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class AiAdService {
  private url = `${environment.apiUrl}/ai-ads`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  adminList(filters: AiAdFilters = {}): Observable<AiAdsResponse> {
    let params = new HttpParams();
    if (filters.status)         params = params.set('status', filters.status);
    if (filters.payment_status) params = params.set('payment_status', filters.payment_status);
    if (filters.user_id)        params = params.set('user_id', filters.user_id);
    if (filters.page)           params = params.set('page', String(filters.page));
    if (filters.limit)          params = params.set('limit', String(filters.limit));

    return this.http.get<AiAdsResponse>(`${this.url}/admin`, {
      headers: this.headers(),
      params,
    });
  }
}
