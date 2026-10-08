import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface RowField { key: string; label: string; rtl?: boolean; multiline?: boolean; placeholder?: string; }

/**
 * Editable rows of free text (trust items, fact rows). Each row has the given fields;
 * blank rows are dropped when emitting, so a half-filled row never reaches the app.
 */
@Component({
  selector: 'app-row-list-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rle">
      <div class="row-card" *ngFor="let r of rows; let i = index; trackBy: track">
        <div class="grid">
          <label *ngFor="let f of fields" [class.wide]="f.multiline">
            <span>{{ f.label }}</span>
            <textarea *ngIf="f.multiline" rows="2" [ngModel]="r[f.key]" (ngModelChange)="set(i, f.key, $event)"
              [name]="name + i + f.key" [dir]="f.rtl ? 'rtl' : 'ltr'" [placeholder]="f.placeholder || ''"></textarea>
            <input *ngIf="!f.multiline" type="text" [ngModel]="r[f.key]" (ngModelChange)="set(i, f.key, $event)"
              [name]="name + i + f.key" [dir]="f.rtl ? 'rtl' : 'ltr'" [placeholder]="f.placeholder || ''" />
          </label>
        </div>
        <button type="button" class="remove" (click)="remove(i)">Remove</button>
      </div>
      <button type="button" class="add" (click)="add()">+ {{ addLabel }}</button>
    </div>
  `,
  styles: [`
    .row-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 0.9rem; margin-bottom: 0.7rem; background: #fafbfc; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.7rem; }
    label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.75rem; font-weight: 600; color: #6b7280; }
    label.wide { grid-column: 1 / -1; }
    input, textarea {
      padding: 0.55rem 0.75rem; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 0.88rem; font-family: inherit;
      outline: none; box-sizing: border-box; width: 100%; resize: vertical; background: #fff;
      &:focus { border-color: #1e3a6e; box-shadow: 0 0 0 3px #e8ecf5; }
    }
    .remove { margin-top: 0.6rem; background: none; border: none; color: #dc2626; font-size: 0.78rem; font-weight: 600; cursor: pointer; padding: 0; }
    .add { background: none; border: 1.5px dashed #c7cdd8; border-radius: 8px; padding: 0.45rem 0.9rem; font-size: 0.82rem; font-weight: 600; color: #1e3a6e; cursor: pointer; font-family: inherit; }
  `],
})
export class RowListEditorComponent {
  @Input({ required: true }) fields!: RowField[];
  @Input() addLabel = 'Add row';
  @Input() name = 'row';
  @Input() set value(v: Record<string, string>[] | null | undefined) {
    this.rows = Array.isArray(v) ? v.map((r) => ({ ...r })) : [];
  }
  @Output() valueChange = new EventEmitter<Record<string, string>[] | null>();

  rows: Record<string, string>[] = [];

  track = (i: number) => i;

  private emit(): void {
    const clean = this.rows
      .map((r) => Object.fromEntries(this.fields.map((f) => [f.key, (r[f.key] ?? '').trim()])))
      .filter((r) => Object.values(r).some(Boolean));
    this.valueChange.emit(clean.length ? clean : null);
  }
  add(): void { this.rows = [...this.rows, Object.fromEntries(this.fields.map((f) => [f.key, '']))]; }
  set(i: number, key: string, v: string): void { this.rows[i] = { ...this.rows[i], [key]: v }; this.emit(); }
  remove(i: number): void { this.rows = this.rows.filter((_, n) => n !== i); this.emit(); }
}
