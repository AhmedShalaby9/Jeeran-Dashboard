// SERVICE — handles all news API calls

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { News, CreateNewsDto, NewsResponse } from '../models/news.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private url = `${environment.apiUrl}/news`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getAll(active?: boolean): Observable<NewsResponse> {
    let params = new HttpParams();
    if (active !== undefined) params = params.set('active', String(active));
    return this.http.get<NewsResponse>(this.url, { headers: this.headers(), params });
  }

  getById(id: number): Observable<{ success: boolean; data: News }> {
    return this.http.get<{ success: boolean; data: News }>(`${this.url}/${id}`, {
      headers: this.headers(),
    });
  }

  create(payload: CreateNewsDto): Observable<{ success: boolean; data: News }> {
    return this.http.post<{ success: boolean; data: News }>(this.url, payload, {
      headers: this.headers(),
    });
  }

  update(id: number, payload: Partial<CreateNewsDto>): Observable<{ success: boolean; data: News }> {
    return this.http.put<{ success: boolean; data: News }>(`${this.url}/${id}`, payload, {
      headers: this.headers(),
    });
  }

  remove(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.url}/${id}`, {
      headers: this.headers(),
    });
  }
}
