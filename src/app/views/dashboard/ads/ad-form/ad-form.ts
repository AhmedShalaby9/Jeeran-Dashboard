import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdService } from '../../../../core/services/ad.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { CreateAdDto } from '../../../../core/models/ad.model';
import { MediaUploaderComponent } from '../../../../shared/components/media-uploader/media-uploader';

@Component({
  selector: 'app-ad-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUploaderComponent],
  templateUrl: './ad-form.html',
  styleUrl: './ad-form.scss',
})
export class AdFormComponent {
  form: CreateAdDto = {
    title_en: '',
    title_ar: '',
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    images: [],
    phone_number: '',
    whatsapp_number: '',
    is_active: true,
  };

  imageInput = '';
  isSubmitting = false;
  errorMessage = '';

  translating = {
    titleToEn: false, titleToAr: false,
    nameToEn: false,  nameToAr: false,
    descToEn: false,  descToAr: false,
  };
  translateErrors = {
    titleToEn: false, titleToAr: false,
    nameToEn: false,  nameToAr: false,
    descToEn: false,  descToAr: false,
  };

  constructor(
    private adService: AdService,
    private translationService: TranslationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  // ── Translation ───────────────────────────────────────────
  translateTitleToEn(): void {
    if (!this.form.title_ar?.trim() || this.translating.titleToEn) return;
    this.translating.titleToEn = true;
    this.translateErrors.titleToEn = false;
    this.translationService.translate(this.form.title_ar, 'ar', 'en').subscribe(result => {
      if (result !== null) this.form.title_en = result;
      else this.translateErrors.titleToEn = true;
      this.translating.titleToEn = false;
      this.cdr.detectChanges();
    });
  }

  translateTitleToAr(): void {
    if (!this.form.title_en?.trim() || this.translating.titleToAr) return;
    this.translating.titleToAr = true;
    this.translateErrors.titleToAr = false;
    this.translationService.translate(this.form.title_en, 'en', 'ar').subscribe(result => {
      if (result !== null) this.form.title_ar = result;
      else this.translateErrors.titleToAr = true;
      this.translating.titleToAr = false;
      this.cdr.detectChanges();
    });
  }

  translateNameToEn(): void {
    if (!this.form.name_ar?.trim() || this.translating.nameToEn) return;
    this.translating.nameToEn = true;
    this.translateErrors.nameToEn = false;
    this.translationService.translate(this.form.name_ar, 'ar', 'en').subscribe(result => {
      if (result !== null) this.form.name_en = result;
      else this.translateErrors.nameToEn = true;
      this.translating.nameToEn = false;
      this.cdr.detectChanges();
    });
  }

  translateNameToAr(): void {
    if (!this.form.name_en?.trim() || this.translating.nameToAr) return;
    this.translating.nameToAr = true;
    this.translateErrors.nameToAr = false;
    this.translationService.translate(this.form.name_en, 'en', 'ar').subscribe(result => {
      if (result !== null) this.form.name_ar = result;
      else this.translateErrors.nameToAr = true;
      this.translating.nameToAr = false;
      this.cdr.detectChanges();
    });
  }

  translateDescToEn(): void {
    if (!this.form.description_ar?.trim() || this.translating.descToEn) return;
    this.translating.descToEn = true;
    this.translateErrors.descToEn = false;
    this.translationService.translate(this.form.description_ar, 'ar', 'en').subscribe(result => {
      if (result !== null) this.form.description_en = result;
      else this.translateErrors.descToEn = true;
      this.translating.descToEn = false;
      this.cdr.detectChanges();
    });
  }

  translateDescToAr(): void {
    if (!this.form.description_en?.trim() || this.translating.descToAr) return;
    this.translating.descToAr = true;
    this.translateErrors.descToAr = false;
    this.translationService.translate(this.form.description_en, 'en', 'ar').subscribe(result => {
      if (result !== null) this.form.description_ar = result;
      else this.translateErrors.descToAr = true;
      this.translating.descToAr = false;
      this.cdr.detectChanges();
    });
  }

  // ── Image helpers ─────────────────────────────────────────
  addImage(): void {
    const val = this.imageInput.trim();
    if (!val) return;
    this.form.images.push(val);
    this.imageInput = '';
  }

  removeImage(index: number): void {
    this.form.images.splice(index, 1);
  }

  onImageKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addImage(); }
  }

  onImagesUploaded(urls: string[]): void {
    urls.forEach(url => this.form.images.push(url));
  }

  // ── Submit ────────────────────────────────────────────────
  onSubmit(): void {
    if (!this.form.title_en?.trim()) {
      this.errorMessage = 'Title (English) is required.';
      return;
    }
    if (!this.form.name_en?.trim()) {
      this.errorMessage = 'Name (English) is required.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.adService.create(this.form).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/dashboard/ads']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to create ad.';
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/ads']);
  }
}
