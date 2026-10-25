import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SavedRequest, SavedRequestCounts, SavedRequestInsights, SavedRequestPage, SavedRequestState } from '../models/saved-request.model';
import { AuthService } from './auth.service';

export interface SavedRequestQuery {
  state?:           SavedRequestState | '';
  matched?:         'true' | 'false' | '';
  handled?:         'true' | 'false' | '';
  property_type?:   string;
  property_status?: string;
  from?:            string;
  to?:              string;
  q?:               string;
  page?:            number;
  limit?:           number;
}

@Injectable({ providedIn: 'root' })
export class SavedRequestService {
  private url = `${environment.apiUrl}/saved-requests/admin`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getPage(query: SavedRequestQuery = {}): Observable<SavedRequestPage> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<SavedRequestPage>(this.url, { headers: this.headers(), params });
  }

  getCounts(): Observable<{ success: boolean; data: SavedRequestCounts }> {
    return this.http.get<{ success: boolean; data: SavedRequestCounts }>(`${this.url}/counts`, { headers: this.headers() });
  }

  getInsights(): Observable<{ success: boolean; data: SavedRequestInsights }> {
    return this.http.get<{ success: boolean; data: SavedRequestInsights }>(`${this.url}/insights`, { headers: this.headers() });
  }

  getById(id: number): Observable<{ success: boolean; data: SavedRequest }> {
    return this.http.get<{ success: boolean; data: SavedRequest }>(`${this.url}/${id}`, { headers: this.headers() });
  }

  update(id: number, patch: { handled?: boolean; admin_note?: string; status?: 'cancelled' }): Observable<{ success: boolean; data: SavedRequest }> {
    return this.http.put<{ success: boolean; data: SavedRequest }>(`${this.url}/${id}`, patch, { headers: this.headers() });
  }
}
