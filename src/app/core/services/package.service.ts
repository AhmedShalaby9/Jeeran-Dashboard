// SERVICE — handles all package API calls

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Package, CreatePackageDto, PackagesResponse } from '../models/package.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PackageService {
  private url = `${environment.apiUrl}/packages`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getAll(): Observable<PackagesResponse> {
    return this.http.get<PackagesResponse>(this.url, { headers: this.headers() });
  }

  getById(id: number): Observable<{ success: boolean; data: Package }> {
    return this.http.get<{ success: boolean; data: Package }>(`${this.url}/${id}`, {
      headers: this.headers(),
    });
  }

  create(payload: CreatePackageDto): Observable<{ success: boolean; data: Package }> {
    return this.http.post<{ success: boolean; data: Package }>(this.url, payload, {
      headers: this.headers(),
    });
  }

  remove(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.url}/${id}`, {
      headers: this.headers(),
    });
  }

  update(id: number, payload: Partial<CreatePackageDto>): Observable<{ success: boolean; data: Package }> {
    return this.http.put<{ success: boolean; data: Package }>(`${this.url}/${id}`, payload, {
      headers: this.headers(),
    });
  }
}
