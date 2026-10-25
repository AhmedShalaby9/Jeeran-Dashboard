import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RowField, RowListEditorComponent } from '../row-list-editor/row-list-editor';
import { TextListEditorComponent } from '../text-list-editor/text-list-editor';
import { MediaUploaderComponent } from '../media-uploader/media-uploader';

/**
 * Reference + location data of a compound: other spellings of its name, coordinates, master plan, brochure and FAQs.
 * Mutates `form` in place. The area outline (boundary) is not edited here — it is kept as imported.
 */
@Component({
  selector: 'app-compound-reference-fields',
  standalone: true,
  imports: [CommonModule, FormsModule, RowListEditorComponent, TextListEditorComponent, MediaUploaderComponent],
  templateUrl: './compound-reference-fields.html',
  styleUrl: '../profile-fields.scss',
})
export class CompoundReferenceFieldsComponent {
  @Input({ required: true }) form!: any;

  readonly faqFields: RowField[] = [
    { key: 'question_en', label: 'Question (English)' },
    { key: 'question_ar', label: 'Question (Arabic)', rtl: true },
    { key: 'answer_en',   label: 'Answer (English)', multiline: true },
    { key: 'answer_ar',   label: 'Answer (Arabic)',  multiline: true, rtl: true },
  ];

  onMasterPlan(urls: string[]): void { if (urls.length) this.form.master_plan = urls[0]; }
}
