import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AMENITIES, FINISHINGS, PAYMENT_OPTIONS } from '../../../core/models/listing-options';

/**
 * Delivery, finishing, payment and amenity tags.
 * On a compound these are the defaults for every unit inside; on a unit they are overrides
 * (`inherit` shows "leave empty to use the compound's" wording). It edits `form` in place.
 */
@Component({
  selector: 'app-listing-attributes-fields',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="laf">
      <p class="note" *ngIf="inherit">Leave a field empty to use the compound’s value.</p>

      <div class="form-row">
        <div class="form-group">
          <label>Delivery date</label>
          <input type="date" [(ngModel)]="form['delivery_date']" name="delivery_date" />
        </div>
        <div class="form-group">
          <label>Finishing</label>
          <select [(ngModel)]="form['finishing']" name="finishing">
            <option [ngValue]="null">{{ inherit ? '— same as compound —' : '— not set —' }}</option>
            <option *ngFor="let f of finishings" [ngValue]="f.value">{{ f.label }}</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Payment options</label>
        <div class="chips">
          <button type="button" class="chip" *ngFor="let p of payments"
            [class.on]="has('payment_options', p.value)" (click)="toggle('payment_options', p.value)">{{ p.label }}</button>
        </div>
      </div>

      <div class="form-row" *ngIf="has('payment_options', 'installments')">
        <div class="form-group">
          <label>Down payment (%)</label>
          <input type="number" min="0" max="100" step="0.5" [(ngModel)]="form['down_payment_percent']" name="down_payment_percent" />
        </div>
        <div class="form-group">
          <label>Installment years</label>
          <input type="number" min="0" max="40" [(ngModel)]="form['installment_years']" name="installment_years" />
        </div>
      </div>

      <div class="form-group">
        <label>{{ inherit ? 'Unit features' : 'Compound amenities' }}</label>
        <div class="chips">
          <button type="button" class="chip" *ngFor="let a of amenities"
            [class.on]="has(tagsKey, a.value)" (click)="toggle(tagsKey, a.value)">{{ a.label }}</button>
        </div>
        <small class="hint">{{ inherit
          ? 'Added to the compound’s amenities when people filter.'
          : 'Shared by every unit here — beach access, golf view, pool …' }}</small>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .note { margin: 0 0 1rem; font-size: 0.82rem; color: #6b7280; }
    .hint { color: #6b7280; font-size: 0.78rem; margin-top: 0.35rem; }
    select {
      padding: 0.7rem 0.9rem; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem;
      color: #1a1f2e; width: 100%; box-sizing: border-box; background: #fff; font-family: inherit; outline: none;
      &:focus { border-color: #1e3a6e; box-shadow: 0 0 0 3px #e8ecf5; }
    }
    .chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .chip {
      padding: 0.45rem 0.85rem; border-radius: 999px; border: 1.5px solid #e5e7eb; background: #fff;
      font-size: 0.82rem; font-weight: 600; color: #6b7280; cursor: pointer; font-family: inherit;
      &.on { background: #f6ecd7; border-color: #d9bd86; color: #8a5f12; }
    }
  `],
})
export class ListingAttributesFieldsComponent {
  /** Object holding delivery_date, finishing, payment_options, down_payment_percent, installment_years + the tags array. */
  @Input({ required: true }) form!: Record<string, any>;
  /** `amenities` on a compound, `features` on a unit. */
  @Input() tagsKey: 'amenities' | 'features' = 'amenities';
  /** Unit mode: empty means "use the compound's". */
  @Input() inherit = false;

  readonly finishings = FINISHINGS;
  readonly payments = PAYMENT_OPTIONS;
  readonly amenities = AMENITIES;

  has(key: string, value: string): boolean {
    return Array.isArray(this.form[key]) && this.form[key].includes(value);
  }

  toggle(key: string, value: string): void {
    const current: string[] = Array.isArray(this.form[key]) ? [...this.form[key]] : [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    // an empty list means "not set" (null), so it can inherit / stay out of the filters
    this.form[key] = next.length ? next : null;
    if (key === 'payment_options' && !this.has('payment_options', 'installments')) {
      this.form['down_payment_percent'] = null;
      this.form['installment_years'] = null;
    }
  }
}
