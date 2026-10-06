import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { PrivacyPolicyResponse, UpdatePrivacyPolicyDto } from '../models/privacy-policy.model';

@Injectable({ providedIn: 'root' })
export class PrivacyPolicyService {
  private url = `${environment.apiUrl}/privacy-policy`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  get(): Observable<PrivacyPolicyResponse> {
    return this.http.get<PrivacyPolicyResponse>(this.url, { headers: this.headers() });
  }

  update(dto: UpdatePrivacyPolicyDto): Observable<PrivacyPolicyResponse> {
    return this.http.put<PrivacyPolicyResponse>(this.url, dto, { headers: this.headers() });
  }
}
