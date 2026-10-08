import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediaUploaderComponent } from '../media-uploader/media-uploader';

/** Optional extras on a unit's page: garden, level, floor plan, maintenance. Mutates `form` in place. */
@Component({
  selector: 'app-unit-details-fields',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUploaderComponent],
  templateUrl: './unit-details-fields.html',
  styleUrl: '../profile-fields.scss',
})
export class UnitDetailsFieldsComponent {
  @Input({ required: true }) form!: any;

  onPlan(urls: string[]): void { if (urls.length) this.form.floor_plan = urls[0]; }
}
