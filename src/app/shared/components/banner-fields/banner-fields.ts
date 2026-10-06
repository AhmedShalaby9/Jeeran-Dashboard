import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  BANNER_SLOTS, BANNER_TARGETS, CreateBannerDto, ID_TARGETS,
} from '../../../core/models/banner.model';
import { Developer } from '../../../core/models/developer.model';
import { MediaUploaderComponent } from '../media-uploader/media-uploader';

/**
 * All banner fields + a live preview of how the creative renders in the app.
 * Used by both "New banner" and the detail screen's edit mode; it mutates `form` in place.
 */
@Component({
  selector: 'app-banner-fields',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUploaderComponent],
  templateUrl: './banner-fields.html',
  styleUrl: './banner-fields.scss',
})
export class BannerFieldsComponent {
  @Input({ required: true }) form!: CreateBannerDto;
  @Input() developers: Developer[] = [];

  readonly slots = BANNER_SLOTS;
  readonly targets = BANNER_TARGETS;

  get needsId(): boolean { return ID_TARGETS.includes(this.form.target_type); }

  get idLabel(): string {
    return ({
      property: 'Property ID', project: 'Project ID', developer: 'Developer ID', news: 'News article ID',
    } as Record<string, string>)[this.form.target_type] ?? 'ID';
  }

  get slotHint(): string {
    return this.slots.find((s) => s.value === this.form.slot)?.hint ?? '';
  }

  get previewHeight(): number { return this.form.slot === 'explore_top' ? 158 : 172; }

  get duration(): string {
    const s = this.form.video_duration;
    if (s == null || s < 0) return '';
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  get sponsorLabel(): string {
    const dev = this.developers.find((d) => d.id === this.form.developer_id);
    return this.form.sponsor_name || dev?.name_en || dev?.name_ar || '';
  }

  onImageUploaded(urls: string[]): void { if (urls.length) this.form.image_url = urls[0]; }
  onVideoUploaded(urls: string[]): void { if (urls.length) this.form.video_url = urls[0]; }

  /** Keep dependent fields coherent when the target kind changes. */
  onTargetChange(): void {
    if (!this.needsId) this.form.target_id = null;
  }
}
