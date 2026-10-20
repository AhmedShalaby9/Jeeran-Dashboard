// SERVICE — the Ad studio's server calls (AI drafts, price checks, approving a changed number)

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdDraft, Banner } from '../models/banner.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdStudioService {
  private url = `${environment.apiUrl}/ad-studio`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  /** Drafts that have not been published or discarded. */
  drafts(): Observable<{ success: boolean; data: AdDraft[] }> {
    return this.http.get<{ success: boolean; data: AdDraft[] }>(`${this.url}/drafts`, { headers: this.headers() });
  }

  discard(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.url}/drafts/${id}`, { headers: this.headers() });
  }

  /** Re-reads every running ad's numbers now; the ids of the ads it paused come back. */
  checkNow(): Observable<{ success: boolean; data: { checked: number; paused: number[] } }> {
    return this.http.post<{ success: boolean; data: { checked: number; paused: number[] } }>(`${this.url}/check`, {}, { headers: this.headers() });
  }

  /** Approves the new numbers of a paused ad. `stale` = some text still holds an old number and needs editing. */
  approve(bannerId: number): Observable<{ success: boolean; data: { banner: Banner; stale: boolean } }> {
    return this.http.post<{ success: boolean; data: { banner: Banner; stale: boolean } }>(`${this.url}/ads/${bannerId}/approve`, {}, { headers: this.headers() });
  }
}
