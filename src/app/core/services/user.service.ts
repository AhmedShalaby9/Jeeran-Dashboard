import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, CreateAdminDto, UpdateUserDto, UsersResponse, UserType } from '../models/user.model';
import { AuthService } from './auth.service';

export interface UserFilters {
  user_type?: UserType;
  is_active?: boolean;
  search?:    string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private url = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getAll(filters: UserFilters = {}): Observable<UsersResponse> {
    let params = new HttpParams();
    if (filters.user_type !== undefined) params = params.set('user_type', filters.user_type);
    if (filters.is_active !== undefined) params = params.set('is_active', String(filters.is_active));
    if (filters.search)                  params = params.set('search', filters.search);
    return this.http.get<UsersResponse>(this.url, { headers: this.headers(), params });
  }

  getById(id: number): Observable<{ success: boolean; data: User }> {
    return this.http.get<{ success: boolean; data: User }>(`${this.url}/${id}`, {
      headers: this.headers(),
    });
  }

  createAdmin(payload: CreateAdminDto): Observable<{ success: boolean; data: User }> {
    return this.http.post<{ success: boolean; data: User }>(this.url, payload, {
      headers: this.headers(),
    });
  }

  update(id: number, payload: UpdateUserDto): Observable<{ success: boolean; data: User }> {
    return this.http.put<{ success: boolean; data: User }>(`${this.url}/${id}`, payload, {
      headers: this.headers(),
    });
  }

  remove(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.url}/${id}`, {
      headers: this.headers(),
    });
  }
}
