// SERVICE — areas (the places people search by)

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Area, AreaResponse, CreateAreaDto } from '../models/area.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AreaService {
  private url = `${environment.apiUrl}/areas`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  /** Admins get every area (including empty and inactive ones) with `all`. */
  getAll(all = true): Observable<AreaResponse> {
    let params = new HttpParams();
    if (all) params = params.set('all', 'true');
    return this.http.get<AreaResponse>(this.url, { headers: this.headers(), params });
  }

  create(payload: Partial<CreateAreaDto>): Observable<{ success: boolean; data: Area }> {
    return this.http.post<{ success: boolean; data: Area }>(this.url, payload, { headers: this.headers() });
  }

  update(id: number, payload: Partial<CreateAreaDto>): Observable<{ success: boolean; data: Area }> {
    return this.http.put<{ success: boolean; data: Area }>(`${this.url}/${id}`, payload, { headers: this.headers() });
  }

  remove(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.url}/${id}`, { headers: this.headers() });
  }
}
