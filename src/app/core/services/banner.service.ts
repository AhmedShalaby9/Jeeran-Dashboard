// SERVICE — handles all banner API calls

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Banner, CreateBannerDto, BannerResponse } from '../models/banner.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class BannerService {
  private url = `${environment.apiUrl}/banners`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getAll(active?: boolean): Observable<BannerResponse> {
    let params = new HttpParams();
    if (active !== undefined) params = params.set('active', String(active));
    return this.http.get<BannerResponse>(this.url, { headers: this.headers(), params });
  }

  getById(id: number): Observable<{ success: boolean; data: Banner }> {
    return this.http.get<{ success: boolean; data: Banner }>(`${this.url}/${id}`, {
      headers: this.headers(),
    });
  }

  create(payload: CreateBannerDto): Observable<{ success: boolean; data: Banner }> {
    return this.http.post<{ success: boolean; data: Banner }>(this.url, payload, {
      headers: this.headers(),
    });
  }

  update(id: number, payload: Partial<CreateBannerDto>): Observable<{ success: boolean; data: Banner }> {
    return this.http.put<{ success: boolean; data: Banner }>(`${this.url}/${id}`, payload, {
      headers: this.headers(),
    });
  }

  remove(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.url}/${id}`, {
      headers: this.headers(),
    });
  }
}
