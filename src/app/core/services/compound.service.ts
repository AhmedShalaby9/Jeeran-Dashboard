// SERVICE — handles all compound API calls

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Compound, CreateCompoundDto, CompoundResponse } from '../models/compound.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CompoundService {
  private url = `${environment.apiUrl}/compounds`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getAll(active?: boolean, developerId?: number): Observable<CompoundResponse> {
    let params = new HttpParams();
    if (active !== undefined) params = params.set('active', String(active));
    if (developerId !== undefined) params = params.set('developer_id', String(developerId));
    return this.http.get<CompoundResponse>(this.url, { headers: this.headers(), params });
  }

  getById(id: number): Observable<{ success: boolean; data: Compound }> {
    return this.http.get<{ success: boolean; data: Compound }>(`${this.url}/${id}`, {
      headers: this.headers(),
    });
  }

  create(payload: CreateCompoundDto): Observable<{ success: boolean; data: Compound }> {
    return this.http.post<{ success: boolean; data: Compound }>(this.url, payload, {
      headers: this.headers(),
    });
  }

  update(id: number, payload: Partial<CreateCompoundDto>): Observable<{ success: boolean; data: Compound }> {
    return this.http.put<{ success: boolean; data: Compound }>(`${this.url}/${id}`, payload, {
      headers: this.headers(),
    });
  }

  remove(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.url}/${id}`, {
      headers: this.headers(),
    });
  }
}
