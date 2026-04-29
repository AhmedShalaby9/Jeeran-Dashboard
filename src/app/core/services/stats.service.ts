import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StatsResponse } from '../models/stats.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private url = `${environment.apiUrl}/stats`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getStats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(this.url, { headers: this.headers() });
  }
}
