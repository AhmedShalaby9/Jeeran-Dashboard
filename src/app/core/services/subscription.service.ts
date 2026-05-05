import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Subscription, SubscriptionFilters, SubscriptionsAdminResponse } from '../models/subscription.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private url = `${environment.apiUrl}/subscriptions`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getAdminAll(filters: SubscriptionFilters = {}): Observable<SubscriptionsAdminResponse> {
    let params = new HttpParams();
    if (filters.status)     params = params.set('status', filters.status);
    if (filters.user_name)  params = params.set('user_name', filters.user_name);
    if (filters.package_id) params = params.set('package_id', String(filters.package_id));
    if (filters.page)       params = params.set('page', String(filters.page));
    if (filters.limit)      params = params.set('limit', String(filters.limit));
    return this.http.get<SubscriptionsAdminResponse>(`${this.url}/admin`, { headers: this.headers(), params });
  }

  getAdminById(id: number): Observable<{ success: boolean; data: Subscription }> {
    return this.http.get<{ success: boolean; data: Subscription }>(`${this.url}/admin/${id}`, {
      headers: this.headers(),
    });
  }

  cancelAdmin(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(
      `${this.url}/admin/${id}/cancel`, {}, { headers: this.headers() },
    );
  }
}
