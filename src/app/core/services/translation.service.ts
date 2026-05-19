import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly url        = 'https://translate.googleapis.com/translate_a/single';
  private readonly CHUNK_SIZE = 1000;

  constructor(private http: HttpClient) {}

  /** Returns translated string, or null on failure. */
  translate(text: string, from: 'ar' | 'en', to: 'ar' | 'en'): Observable<string | null> {
    const trimmed = text.trim();
    if (!trimmed) return of('');

    const chunks = this.chunkText(trimmed, this.CHUNK_SIZE);

    if (chunks.length === 1) {
      return this.translateChunk(chunks[0], from, to);
    }

    return forkJoin(chunks.map(c => this.translateChunk(c, from, to))).pipe(
      map(results => results.some(r => r === null) ? null : results.join(' ')),
    );
  }

  private translateChunk(text: string, from: string, to: string): Observable<string | null> {
    return this.http.get<any>(this.url, {
      params: { client: 'gtx', sl: from, tl: to, dt: 't', q: text },
    }).pipe(
      map(res => {
        if (!Array.isArray(res) || !Array.isArray(res[0])) return null;
        return (res[0] as any[][])
          .map(part => part[0])
          .filter(Boolean)
          .join('');
      }),
      catchError(() => of(null)),
    );
  }

  private chunkText(text: string, maxLen: number): string[] {
    if (text.length <= maxLen) return [text];
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
      let end = start + maxLen;
      if (end >= text.length) { chunks.push(text.slice(start)); break; }
      const spaceIdx = text.lastIndexOf(' ', end);
      if (spaceIdx > start) end = spaceIdx;
      chunks.push(text.slice(start, end));
      start = end + (text[end] === ' ' ? 1 : 0);
    }
    return chunks;
  }
}
