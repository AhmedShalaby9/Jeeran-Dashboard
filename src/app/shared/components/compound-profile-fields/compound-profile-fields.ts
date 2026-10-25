import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RowField, RowListEditorComponent } from '../row-list-editor/row-list-editor';
import { TextListEditorComponent } from '../text-list-editor/text-list-editor';

/** Facilities, extra facts and the delivered-since year of a compound. Mutates `form` in place. */
@Component({
  selector: 'app-compound-profile-fields',
  standalone: true,
  imports: [CommonModule, FormsModule, RowListEditorComponent, TextListEditorComponent],
  templateUrl: './compound-profile-fields.html',
  styleUrl: '../profile-fields.scss',
})
export class CompoundProfileFieldsComponent {
  @Input({ required: true }) form!: any;

  readonly factFields: RowField[] = [
    { key: 'label_ar', label: 'Label (Arabic)',  rtl: true },
    { key: 'label_en', label: 'Label (English)' },
    { key: 'value_ar', label: 'Value (Arabic)',  rtl: true },
    { key: 'value_en', label: 'Value (English)' },
  ];
}
