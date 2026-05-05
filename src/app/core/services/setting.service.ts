import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SettingsResponse, UpdateSettingsDto } from '../models/setting.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SettingService {
  private url = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  get(): Observable<SettingsResponse> {
    return this.http.get<SettingsResponse>(this.url);
  }

  update(dto: UpdateSettingsDto): Observable<SettingsResponse> {
    return this.http.put<SettingsResponse>(this.url, dto, { headers: this.headers() });
  }
}
