import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private url = `${environment.apiUrl}/upload`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private authHeader(): HttpHeaders {
    // Do NOT set Content-Type — browser sets it automatically with boundary for FormData
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  /** Upload a single file. Returns the resulting public URL. */
  uploadSingle(file: File, folder: string): Observable<string> {
    const body = new FormData();
    body.append('file', file);
    return this.http
      .post<any>(`${this.url}/single?folder=${encodeURIComponent(folder)}`, body, {
        headers: this.authHeader(),
      })
      .pipe(map(res => res?.url ?? res?.data?.url ?? res?.data ?? ''));
  }

  /** Upload multiple files. Returns an array of public URLs. */
  uploadMultiple(files: File[], folder: string): Observable<string[]> {
    const body = new FormData();
    files.forEach(f => body.append('files', f));
    return this.http
      .post<any>(`${this.url}/multiple?folder=${encodeURIComponent(folder)}`, body, {
        headers: this.authHeader(),
      })
      .pipe(map(res => res?.urls ?? res?.data?.urls ?? res?.data ?? []));
  }
}
