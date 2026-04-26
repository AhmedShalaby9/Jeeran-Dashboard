import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Property } from '../models/property.model';
import { AuthService } from './auth.service';

export interface FavoriteItem {
  id:          number;
  user_id:     number;
  property_id: number;
  created_at:  string;
  property?:   Property;
}

export interface FavoritesResponse {
  success: boolean;
  data:    FavoriteItem[];
  pagination?: {
    page:  number;
    limit: number;
    total: number;
    pages: number;
  };
  total?: number;
}

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private url = `${environment.apiUrl}/favorites`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getUserFavorites(userId: number, page = 1, limit = 20): Observable<FavoritesResponse> {
    return this.http.get<FavoritesResponse>(
      `${this.url}/user/${userId}`,
      { headers: this.headers(), params: { page: String(page), limit: String(limit) } },
    );
  }
}
