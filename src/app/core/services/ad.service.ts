// SERVICE — handles all ads API calls

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ad, CreateAdDto, AdResponse } from '../models/ad.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdService {
  private url = `${environment.apiUrl}/ads`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getAll(active?: boolean): Observable<AdResponse> {
    let params = new HttpParams();
    if (active !== undefined) params = params.set('active', String(active));
    return this.http.get<AdResponse>(this.url, { headers: this.headers(), params });
  }

  getById(id: number): Observable<{ success: boolean; data: Ad }> {
    return this.http.get<{ success: boolean; data: Ad }>(`${this.url}/${id}`, {
      headers: this.headers(),
    });
  }

  create(payload: CreateAdDto): Observable<{ success: boolean; data: Ad }> {
    return this.http.post<{ success: boolean; data: Ad }>(this.url, payload, {
      headers: this.headers(),
    });
  }

  update(id: number, payload: Partial<CreateAdDto>): Observable<{ success: boolean; data: Ad }> {
    return this.http.put<{ success: boolean; data: Ad }>(`${this.url}/${id}`, payload, {
      headers: this.headers(),
    });
  }

  remove(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.url}/${id}`, {
      headers: this.headers(),
    });
  }
}
