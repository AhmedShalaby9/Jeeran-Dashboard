import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateDeveloperDto } from '../../../core/models/developer.model';
import { MediaUploaderComponent } from '../media-uploader/media-uploader';
import { RowField, RowListEditorComponent } from '../row-list-editor/row-list-editor';

/** What the developer page shows beyond the basics. Mutates `form` in place. */
@Component({
  selector: 'app-developer-profile-fields',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUploaderComponent, RowListEditorComponent],
  templateUrl: './developer-profile-fields.html',
  styleUrl: '../profile-fields.scss',
})
export class DeveloperProfileFieldsComponent {
  @Input({ required: true }) form!: CreateDeveloperDto;

  readonly trustFields: RowField[] = [
    { key: 'title_ar',  label: 'Title (Arabic)',  rtl: true },
    { key: 'title_en',  label: 'Title (English)' },
    { key: 'detail_ar', label: 'Detail (Arabic)',  rtl: true, multiline: true },
    { key: 'detail_en', label: 'Detail (English)', multiline: true },
  ];

  onCover(urls: string[]): void { if (urls.length) this.form.cover_image = urls[0]; }
}
