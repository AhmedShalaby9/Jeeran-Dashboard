// SERVICE — handles all property API calls

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Property, CreatePropertyDto, PropertyListResponse, PropertyResponse } from '../models/property.model';
import { AuthService } from './auth.service';

export interface PropertyFilters {
  page?:        number;
  limit?:       number;
  type?:        string;
  status?:      string;
  project_id?:  number;
  is_featured?: boolean;
  is_approved?: 'true' | 'false' | 'null'; // 'null' = pending
  min_price?:   number;
  max_price?:   number;
  bedrooms?:    number;
  agent_name?:  string;
  q?:           string;
  sort?:        string;
  order?:       'ASC' | 'DESC';
}

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private url = `${environment.apiUrl}/properties`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getAll(filters: PropertyFilters = {}): Observable<PropertyListResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<PropertyListResponse>(this.url, { headers: this.headers(), params });
  }

  getById(id: number): Observable<PropertyResponse> {
    return this.http.get<PropertyResponse>(`${this.url}/${id}`, { headers: this.headers() });
  }

  create(payload: CreatePropertyDto): Observable<PropertyResponse> {
    return this.http.post<PropertyResponse>(this.url, payload, { headers: this.headers() });
  }

  update(id: number, payload: Partial<CreatePropertyDto>): Observable<PropertyResponse> {
    return this.http.put<PropertyResponse>(`${this.url}/${id}`, payload, { headers: this.headers() });
  }

  remove(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.url}/${id}`, {
      headers: this.headers(),
    });
  }

  getSimilar(id: number): Observable<PropertyListResponse> {
    return this.http.get<PropertyListResponse>(`${this.url}/${id}/similar`, { headers: this.headers() });
  }

  approve(id: number): Observable<PropertyResponse> {
    return this.http.patch<PropertyResponse>(`${this.url}/${id}/approve`, {}, { headers: this.headers() });
  }

  reject(id: number): Observable<PropertyResponse> {
    return this.http.patch<PropertyResponse>(`${this.url}/${id}/reject`, {}, { headers: this.headers() });
  }
}
