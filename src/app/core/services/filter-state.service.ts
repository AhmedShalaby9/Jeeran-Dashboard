import { Injectable } from '@angular/core';

/**
 * Persists filter/pagination state per page key using sessionStorage.
 * State survives in-app navigation but is cleared when the browser tab closes.
 */
@Injectable({ providedIn: 'root' })
export class FilterStateService {

  save(key: string, state: Record<string, unknown>): void {
    try {
      sessionStorage.setItem(`filter_${key}`, JSON.stringify(state));
    } catch {}
  }

  restore<T extends Record<string, unknown>>(key: string): T | null {
    try {
      const raw = sessionStorage.getItem(`filter_${key}`);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  clear(key: string): void {
    sessionStorage.removeItem(`filter_${key}`);
  }
}
