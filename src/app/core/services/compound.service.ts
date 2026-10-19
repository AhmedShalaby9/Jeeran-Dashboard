// SERVICE — handles all compound API calls

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Compound, CreateCompoundDto, CompoundResponse, CompoundPage, CompoundListQuery, CompoundListMeta } from '../models/compound.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CompoundService {
  private url = `${environment.apiUrl}/compounds`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getAll(active?: boolean, developerId?: number): Observable<CompoundResponse> {
    let params = new HttpParams();
    if (active !== undefined) params = params.set('active', String(active));
    if (developerId !== undefined) params = params.set('developer_id', String(developerId));
    return this.http.get<CompoundResponse>(this.url, { headers: this.headers(), params });
  }

  /** One page of compounds, searched / filtered / sorted by the server. */
  getPage(query: CompoundListQuery): Observable<CompoundPage> {
    let params = new HttpParams().set('page', String(query.page)).set('limit', String(query.limit));
    if (query.q?.trim()) params = params.set('q', query.q.trim());
    if (query.sort) params = params.set('sort', query.sort);
    if (query.filter && query.filter !== 'all') params = params.set('filter', query.filter);
    if (query.developerId !== undefined && query.developerId !== '') params = params.set('developer_id', String(query.developerId));
    if (query.areaId !== undefined && query.areaId !== '') params = params.set('area_id', String(query.areaId));
    return this.http.get<CompoundPage>(`${this.url}/admin/list`, { headers: this.headers(), params });
  }

  getListMeta(): Observable<{ success: boolean; data: CompoundListMeta }> {
    return this.http.get<{ success: boolean; data: CompoundListMeta }>(`${this.url}/admin/meta`, { headers: this.headers() });
  }

  getById(id: number): Observable<{ success: boolean; data: Compound }> {
    return this.http.get<{ success: boolean; data: Compound }>(`${this.url}/${id}`, {
      headers: this.headers(),
    });
  }

  create(payload: CreateCompoundDto): Observable<{ success: boolean; data: Compound }> {
    return this.http.post<{ success: boolean; data: Compound }>(this.url, payload, {
      headers: this.headers(),
    });
  }

  update(id: number, payload: Partial<CreateCompoundDto>): Observable<{ success: boolean; data: Compound }> {
    return this.http.put<{ success: boolean; data: Compound }>(`${this.url}/${id}`, payload, {
      headers: this.headers(),
    });
  }

  /** The plan's three files (.tif + .tfw + .prj); the server converts them and works out where it sits. */
  uploadPlanOverlay(id: number, tif: File, tfw: File, prj: File): Observable<{ success: boolean; data: { plan_overlay_url: string; plan_bounds: [number, number, number, number] } }> {
    const body = new FormData();
    body.append('tif', tif);
    body.append('tfw', tfw);
    body.append('prj', prj);
    return this.http.put<any>(`${this.url}/${id}/plan-overlay`, body, { headers: this.headers() });
  }

  removePlanOverlay(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.url}/${id}/plan-overlay`, { headers: this.headers() });
  }

  remove(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.url}/${id}`, {
      headers: this.headers(),
    });
  }
}
