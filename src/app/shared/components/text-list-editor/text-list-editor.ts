import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/** An editable list of short texts (facilities). Emits the cleaned list, or null when empty. */
@Component({
  selector: 'app-text-list-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tle">
      <div class="item" *ngFor="let it of items; let i = index; trackBy: track">
        <input type="text" [ngModel]="it" (ngModelChange)="set(i, $event)" [name]="name + i"
          [dir]="rtl ? 'rtl' : 'ltr'" [placeholder]="placeholder" maxlength="80" />
        <button type="button" class="x" (click)="remove(i)" title="Remove">×</button>
      </div>
      <button type="button" class="add" (click)="add()">+ Add</button>
    </div>
  `,
  styles: [`
    .item { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
    .item input {
      flex: 1; padding: 0.6rem 0.8rem; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem;
      font-family: inherit; outline: none; box-sizing: border-box;
      &:focus { border-color: #1e3a6e; box-shadow: 0 0 0 3px #e8ecf5; }
    }
    .x { width: 34px; border: 1.5px solid #e5e7eb; background: #fff; border-radius: 8px; cursor: pointer; color: #dc2626; font-size: 1.1rem; }
    .add { background: none; border: 1.5px dashed #c7cdd8; border-radius: 8px; padding: 0.45rem 0.9rem; font-size: 0.82rem; font-weight: 600; color: #1e3a6e; cursor: pointer; font-family: inherit; }
  `],
})
export class TextListEditorComponent {
  @Input() set value(v: string[] | null | undefined) { this.items = Array.isArray(v) ? [...v] : []; }
  @Input() placeholder = '';
  @Input() rtl = false;
  @Input() name = 'item';
  @Output() valueChange = new EventEmitter<string[] | null>();

  items: string[] = [];

  track = (i: number) => i;

  private emit(): void {
    const clean = this.items.map((x) => x.trim()).filter(Boolean);
    this.valueChange.emit(clean.length ? clean : null);
  }
  add(): void { this.items = [...this.items, '']; }
  set(i: number, v: string): void { this.items[i] = v; this.emit(); }
  remove(i: number): void { this.items = this.items.filter((_, n) => n !== i); this.emit(); }
}
