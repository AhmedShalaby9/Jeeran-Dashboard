import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FavoriteItem,
  FavoritesResponse,
  AdminFavoritesResponse,
  ToggleFavoriteDto,
  ToggleFavoriteResponse,
} from '../models/favorite.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private url = `${environment.apiUrl}/favorites`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getMyFavorites(): Observable<FavoritesResponse> {
    return this.http.get<FavoritesResponse>(this.url, { headers: this.headers() });
  }

  getUserFavorites(userId: number, page = 1, limit = 20): Observable<FavoritesResponse> {
    return this.http.get<FavoritesResponse>(
      `${this.url}/user/${userId}`,
      { headers: this.headers(), params: { page: String(page), limit: String(limit) } },
    );
  }

  getAllFavoritesAdmin(filters: { search?: string; date_from?: string; date_to?: string; page?: number; limit?: number } = {}): Observable<AdminFavoritesResponse> {
    let params = new HttpParams();
    if (filters.search)    params = params.set('search', filters.search);
    if (filters.date_from) params = params.set('date_from', filters.date_from);
    if (filters.date_to)   params = params.set('date_to', filters.date_to);
    if (filters.page)      params = params.set('page', String(filters.page));
    if (filters.limit)     params = params.set('limit', String(filters.limit));
    return this.http.get<AdminFavoritesResponse>(`${this.url}/admin/all`, { headers: this.headers(), params });
  }

  toggle(payload: ToggleFavoriteDto): Observable<ToggleFavoriteResponse> {
    return this.http.post<ToggleFavoriteResponse>(this.url, payload, { headers: this.headers() });
  }
}
