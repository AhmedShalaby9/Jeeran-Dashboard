import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Lang = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class LangService {
  private _lang = new BehaviorSubject<Lang>('en');

  readonly lang$ = this._lang.asObservable();

  get lang(): Lang { return this._lang.value; }

  set(lang: Lang): void { this._lang.next(lang); }

  toggle(): void { this._lang.next(this._lang.value === 'en' ? 'ar' : 'en'); }
}
