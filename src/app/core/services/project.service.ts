// SERVICE — handles all project API calls

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, CreateProjectDto, ProjectResponse } from '../models/project.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private url = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getAll(active?: boolean): Observable<ProjectResponse> {
    let params = new HttpParams();
    if (active !== undefined) params = params.set('active', String(active));
    return this.http.get<ProjectResponse>(this.url, { headers: this.headers(), params });
  }

  getById(id: number): Observable<{ success: boolean; data: Project }> {
    return this.http.get<{ success: boolean; data: Project }>(`${this.url}/${id}`, {
      headers: this.headers(),
    });
  }

  create(payload: CreateProjectDto): Observable<{ success: boolean; data: Project }> {
    return this.http.post<{ success: boolean; data: Project }>(this.url, payload, {
      headers: this.headers(),
    });
  }

  update(id: number, payload: Partial<CreateProjectDto>): Observable<{ success: boolean; data: Project }> {
    return this.http.put<{ success: boolean; data: Project }>(`${this.url}/${id}`, payload, {
      headers: this.headers(),
    });
  }

  remove(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.url}/${id}`, {
      headers: this.headers(),
    });
  }
}
