// SERVICE — launches & offers on compounds

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Promotion, PromotionResponse } from '../models/promotion.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PromotionService {
  private url = `${environment.apiUrl}/promotions`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  /** `all` = every promotion including history; otherwise only what is live in the app. */
  getAll(opts: { all?: boolean; compoundId?: number } = {}): Observable<PromotionResponse> {
    let params = new HttpParams();
    if (opts.all) params = params.set('all', 'true');
    if (opts.compoundId) params = params.set('compound_id', String(opts.compoundId));
    return this.http.get<PromotionResponse>(this.url, { headers: this.headers(), params });
  }

  create(payload: Record<string, unknown>): Observable<{ success: boolean; data: Promotion }> {
    return this.http.post<{ success: boolean; data: Promotion }>(this.url, payload, { headers: this.headers() });
  }

  update(id: number, payload: Record<string, unknown>): Observable<{ success: boolean; data: Promotion }> {
    return this.http.put<{ success: boolean; data: Promotion }>(`${this.url}/${id}`, payload, { headers: this.headers() });
  }

  /** Ends it now (history is kept). */
  end(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.url}/${id}`, { headers: this.headers() });
  }
}
