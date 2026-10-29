import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediaUploaderComponent } from '../media-uploader/media-uploader';
import { TranslationService } from '../../../core/services/translation.service';

/** Optional extras on a unit's page: garden / land / outdoor areas (by type), level, floor plan, maintenance. Mutates `form` in place. */
@Component({
  selector: 'app-unit-details-fields',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUploaderComponent],
  templateUrl: './unit-details-fields.html',
  styleUrl: '../profile-fields.scss',
})
export class UnitDetailsFieldsComponent {
  @Input({ required: true }) form!: any;

  constructor(private translationService: TranslationService) {}

  translatingLevel = { toEn: false, toAr: false };
  levelTranslateError = false;

  translateLevelToEn(): void {
    if (!this.form.level_ar?.trim() || this.translatingLevel.toEn) return;
    this.translatingLevel.toEn = true;
    this.levelTranslateError    = false;
    this.translationService.translate(this.form.level_ar, 'ar', 'en').subscribe(result => {
      if (result !== null) this.form.level_en = result;
      else this.levelTranslateError = true;
      this.translatingLevel.toEn = false;
    });
  }

  translateLevelToAr(): void {
    if (!this.form.level_en?.trim() || this.translatingLevel.toAr) return;
    this.translatingLevel.toAr = true;
    this.levelTranslateError    = false;
    this.translationService.translate(this.form.level_en, 'en', 'ar').subscribe(result => {
      if (result !== null) this.form.level_ar = result;
      else this.levelTranslateError = true;
      this.translatingLevel.toAr = false;
    });
  }

  private static readonly VILLAS = ['villa', 'townhouse', 'twinhouse', 'family_house'];
  private static readonly GARDEN_CHOICE = ['apartment', 'chalet', 'duplex'];

  /** Villas of every kind: the plot, next to the built-up area. */
  get asksLand(): boolean { return UnitDetailsFieldsComponent.VILLAS.includes(this.form.property_type); }
  /** Flats, chalets, duplexes: a ground-floor unit with a garden? */
  get asksGardenChoice(): boolean { return UnitDetailsFieldsComponent.GARDEN_CHOICE.includes(this.form.property_type); }
  /** Shops: an outdoor area? */
  get asksOutdoor(): boolean { return this.form.property_type === 'shop'; }
  /** The garden size shows for the other houses always, and for flats/chalets/duplexes once they have a garden. */
  get showGardenSize(): boolean {
    return this.asksGardenChoice ? this.form.has_garden === true : !this.asksOutdoor;
  }

  onGardenChoice(): void { if (this.form.has_garden === false) this.form.garden_size = null; }
  onOutdoorChoice(): void { if (this.form.has_outdoor === false) this.form.outdoor_size = null; }

  onPlan(urls: string[]): void { if (urls.length) this.form.floor_plan = urls[0]; }
}
