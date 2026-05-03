import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface MyMemoryResponse {
  responseStatus: number;
  responseData: { translatedText: string };
}

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly url = 'https://api.mymemory.translated.net/get';

  constructor(private http: HttpClient) {}

  translate(text: string, from: 'ar' | 'en', to: 'ar' | 'en'): Observable<string> {
    if (!text.trim()) return of('');
    return this.http.get<MyMemoryResponse>(this.url, {
      params: { q: text.trim(), langpair: `${from}|${to}` },
    }).pipe(
      map(res => res?.responseData?.translatedText ?? ''),
      catchError(() => of('')),
    );
  }
}
