import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Developer, CreateDeveloperDto, DeveloperResponse } from '../models/developer.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class DeveloperService {
  private url = `${environment.apiUrl}/developers`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getAll(active?: boolean): Observable<DeveloperResponse> {
    let params = new HttpParams();
    if (active !== undefined) params = params.set('active', String(active));
    return this.http.get<DeveloperResponse>(this.url, { headers: this.headers(), params });
  }

  getById(id: number): Observable<{ success: boolean; data: Developer }> {
    return this.http.get<{ success: boolean; data: Developer }>(`${this.url}/${id}`, {
      headers: this.headers(),
    });
  }

  create(payload: CreateDeveloperDto): Observable<{ success: boolean; data: Developer }> {
    return this.http.post<{ success: boolean; data: Developer }>(this.url, payload, {
      headers: this.headers(),
    });
  }

  update(id: number, payload: Partial<CreateDeveloperDto>): Observable<{ success: boolean; data: Developer }> {
    return this.http.put<{ success: boolean; data: Developer }>(`${this.url}/${id}`, payload, {
      headers: this.headers(),
    });
  }

  remove(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.url}/${id}`, {
      headers: this.headers(),
    });
  }
}
