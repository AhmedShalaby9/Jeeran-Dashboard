// SERVICE — phases of a compound

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Phase } from '../models/phase.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PhaseService {
  private url = `${environment.apiUrl}/phases`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  /** Admins also get inactive phases. */
  getForCompound(compoundId: number): Observable<{ success: boolean; data: Phase[] }> {
    const params = new HttpParams().set('compound_id', String(compoundId));
    return this.http.get<{ success: boolean; data: Phase[] }>(this.url, { headers: this.headers(), params });
  }

  create(payload: Record<string, unknown>): Observable<{ success: boolean; data: Phase }> {
    return this.http.post<{ success: boolean; data: Phase }>(this.url, payload, { headers: this.headers() });
  }

  update(id: number, payload: Record<string, unknown>): Observable<{ success: boolean; data: Phase }> {
    return this.http.put<{ success: boolean; data: Phase }>(`${this.url}/${id}`, payload, { headers: this.headers() });
  }

  remove(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.url}/${id}`, { headers: this.headers() });
  }
}
