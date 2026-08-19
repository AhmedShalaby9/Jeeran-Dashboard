import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeveloperService } from '../../../../core/services/developer.service';
import { CreateDeveloperDto } from '../../../../core/models/developer.model';
import { MediaUploaderComponent } from '../../../../shared/components/media-uploader/media-uploader';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'app-developer-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUploaderComponent],
  templateUrl: './developer-form.html',
  styleUrl: './developer-form.scss',
})
export class DeveloperFormComponent {
  form: CreateDeveloperDto = {
    name_ar:   '',
    name_en:   '',
    logo:      null,
    desc_ar:   '',
    desc_en:   '',
    phone:     '',
    email:     '',
    website:   '',
    address:   '',
    facebook:  '',
    instagram: '',
    twitter:   '',
    linkedin:  '',
    is_active: true,
  };

  isSubmitting = false;
  errorMessage = '';

  translating = {
    nameToEn: false, nameToAr: false,
    descToEn: false, descToAr: false,
  };

  translateErrors = {
    nameToEn: false, nameToAr: false,
    descToEn: false, descToAr: false,
  };

  constructor(
    private developerService:   DeveloperService,
    private translationService: TranslationService,
    private router:             Router,
    private cdr:                ChangeDetectorRef,
  ) {}

  translateNameToEn(): void {
    if (!this.form.name_ar?.trim() || this.translating.nameToEn) return;
    this.translating.nameToEn = true; this.translateErrors.nameToEn = false;
    this.translationService.translate(this.form.name_ar, 'ar', 'en').subscribe(r => {
      if (r !== null) this.form.name_en = r; else this.translateErrors.nameToEn = true;
      this.translating.nameToEn = false; this.cdr.detectChanges();
    });
  }

  translateNameToAr(): void {
    if (!this.form.name_en?.trim() || this.translating.nameToAr) return;
    this.translating.nameToAr = true; this.translateErrors.nameToAr = false;
    this.translationService.translate(this.form.name_en!, 'en', 'ar').subscribe(r => {
      if (r !== null) this.form.name_ar = r; else this.translateErrors.nameToAr = true;
      this.translating.nameToAr = false; this.cdr.detectChanges();
    });
  }

  translateDescToEn(): void {
    if (!this.form.desc_ar?.trim() || this.translating.descToEn) return;
    this.translating.descToEn = true; this.translateErrors.descToEn = false;
    this.translationService.translate(this.form.desc_ar!, 'ar', 'en').subscribe(r => {
      if (r !== null) this.form.desc_en = r; else this.translateErrors.descToEn = true;
      this.translating.descToEn = false; this.cdr.detectChanges();
    });
  }

  translateDescToAr(): void {
    if (!this.form.desc_en?.trim() || this.translating.descToAr) return;
    this.translating.descToAr = true; this.translateErrors.descToAr = false;
    this.translationService.translate(this.form.desc_en!, 'en', 'ar').subscribe(r => {
      if (r !== null) this.form.desc_ar = r; else this.translateErrors.descToAr = true;
      this.translating.descToAr = false; this.cdr.detectChanges();
    });
  }

  onLogoUploaded(urls: string[]): void {
    if (urls.length) this.form.logo = urls[0];
  }

  onSubmit(): void {
    if (!this.form.name_ar.trim()) {
      this.errorMessage = 'Arabic name is required.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    this.developerService.create(this.form).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/dashboard/developers']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to create developer.';
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void { this.router.navigate(['/dashboard/developers']); }
}
