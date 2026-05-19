import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PackageService } from '../../../../core/services/package.service';
import { CreatePackageDto } from '../../../../core/models/package.model';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'app-package-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './package-form.html',
  styleUrl: './package-form.scss',
})
export class PackageFormComponent {
  form: CreatePackageDto = {
    title_en:           '',
    title_ar:           '',
    price:              0,
    duration_days:      30,
    description_en:     '',
    description_ar:     '',
    available_listings: 0,
    featured_listings:  0,
    features:           [],
  };

  featureInput = '';
  isSubmitting = false;
  errorMessage = '';

  translating = {
    titleToEn: false,
    titleToAr: false,
    descToEn:  false,
    descToAr:  false,
  };

  translateErrors = {
    titleToEn: false,
    titleToAr: false,
    descToEn:  false,
    descToAr:  false,
  };

  constructor(
    private packageService:     PackageService,
    private translationService: TranslationService,
    private router:             Router,
    private cdr:                ChangeDetectorRef,
  ) {}

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

  addFeature(): void {
    const val = this.featureInput.trim();
    if (!val) return;
    if (!this.form.features) this.form.features = [];
    this.form.features.push(val);
    this.featureInput = '';
  }

  removeFeature(index: number): void {
    this.form.features?.splice(index, 1);
  }

  onFeatureKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addFeature();
    }
  }

  onSubmit(): void {
    if (!this.form.title_en?.trim() && !this.form.title_ar?.trim()) {
      this.errorMessage = 'At least one title (English or Arabic) is required.';
      return;
    }
    if (!this.form.duration_days) {
      this.errorMessage = 'Duration is required.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload: CreatePackageDto = {
      ...this.form,
      title_en:       this.form.title_en?.trim()       || '',
      title_ar:       this.form.title_ar?.trim()       || '',
      description_en: this.form.description_en?.trim() || null,
      description_ar: this.form.description_ar?.trim() || null,
    };

    this.packageService.create(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/dashboard/packages']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to create package.';
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/packages']);
  }
}
