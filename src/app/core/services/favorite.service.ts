import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FavoriteItem,
  FavoritesResponse,
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

  toggle(payload: ToggleFavoriteDto): Observable<ToggleFavoriteResponse> {
    return this.http.post<ToggleFavoriteResponse>(this.url, payload, { headers: this.headers() });
  }
}
