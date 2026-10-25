// SERVICE — the AI ads admins make in the app (read, and remove)

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminAiAd } from '../models/admin-ai-ad.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdStudioService {
  private url = `${environment.apiUrl}/ad-studio`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  /** AI ads that have not been deleted. */
  list(): Observable<{ success: boolean; data: AdminAiAd[] }> {
    return this.http.get<{ success: boolean; data: AdminAiAd[] }>(`${this.url}/drafts`, { headers: this.headers() });
  }

  remove(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.url}/drafts/${id}`, { headers: this.headers() });
  }
}
