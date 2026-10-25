import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CallRequest, CallRequestCounts, CallRequestPage, CallRequestStatus } from '../models/call-request.model';
import { AuthService } from './auth.service';

export interface CallRequestQuery {
  status?: CallRequestStatus | '';
  q?:      string;
  page?:   number;
  limit?:  number;
}

@Injectable({ providedIn: 'root' })
export class CallRequestService {
  private url = `${environment.apiUrl}/call-requests`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getPage(query: CallRequestQuery = {}): Observable<CallRequestPage> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<CallRequestPage>(this.url, { headers: this.headers(), params });
  }

  getCounts(): Observable<{ success: boolean; data: CallRequestCounts }> {
    return this.http.get<{ success: boolean; data: CallRequestCounts }>(`${this.url}/counts`, { headers: this.headers() });
  }

  update(id: number, patch: { status?: CallRequestStatus; admin_note?: string }): Observable<{ success: boolean; data: CallRequest }> {
    return this.http.put<{ success: boolean; data: CallRequest }>(`${this.url}/${id}`, patch, { headers: this.headers() });
  }
}
