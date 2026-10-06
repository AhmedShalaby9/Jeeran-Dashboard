// SERVICE — handles all seller-request API calls

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  SellerRequest,
  SellerRequestStatus,
  SellerRequestListResponse,
  SellerRequestResponse,
} from '../models/seller-request.model';
import { AuthService } from './auth.service';

export interface SellerRequestFilters {
  status?: SellerRequestStatus | '';
  page?:   number;
  limit?:  number;
}

@Injectable({ providedIn: 'root' })
export class SellerRequestService {
  private url = `${environment.apiUrl}/seller-requests`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getAll(filters: SellerRequestFilters = {}): Observable<SellerRequestListResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<SellerRequestListResponse>(this.url, { headers: this.headers(), params });
  }

  getById(id: number): Observable<SellerRequestResponse> {
    return this.http.get<SellerRequestResponse>(`${this.url}/${id}`, { headers: this.headers() });
  }

  // The API answers approve/reject with { success, message } only — reload the request afterwards.
  approve(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.url}/${id}/approve`, {}, { headers: this.headers() });
  }

  /** `reason` is shown to the applicant (in the app and in the push notification). */
  reject(id: number, reason?: string): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.url}/${id}/reject`, { reason: reason?.trim() || undefined }, { headers: this.headers() });
  }
}
