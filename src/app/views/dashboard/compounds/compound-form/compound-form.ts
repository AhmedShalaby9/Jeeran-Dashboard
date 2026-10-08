import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompoundService } from '../../../../core/services/compound.service';
import { CreateCompoundDto, CompoundFeature } from '../../../../core/models/compound.model';
import { DeveloperService } from '../../../../core/services/developer.service';
import { Developer } from '../../../../core/models/developer.model';
import { MediaUploaderComponent } from '../../../../shared/components/media-uploader/media-uploader';
import { TranslationService } from '../../../../core/services/translation.service';
import { CompoundProfileFieldsComponent } from '../../../../shared/components/compound-profile-fields/compound-profile-fields';
import { ListingAttributesFieldsComponent } from '../../../../shared/components/listing-attributes-fields/listing-attributes-fields';
import { AreaService } from '../../../../core/services/area.service';
import { Area } from '../../../../core/models/area.model';

@Component({
  selector: 'app-compound-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUploaderComponent, ListingAttributesFieldsComponent, CompoundProfileFieldsComponent],
  templateUrl: './compound-form.html',
  styleUrl: './compound-form.scss',
})
export class CompoundFormComponent {
  developers: Developer[] = [];
  areas: Area[] = [];

  form: CreateCompoundDto = {
    developer_id:  null,
    area_id:       null,
    delivery_date: null,
    finishing:     null,
    payment_options: null,
    down_payment_percent: null,
    installment_years:    null,
    amenities:     null,
    facilities_ar: null,
    facilities_en: null,
    facts: null,
    delivered_since: null,
    name_ar:    '',
    name_en:    '',
    desc_ar:    '',
    desc_en:    '',
    main_image: null,
    gallery:    [],
    features:   [],
    is_active:  true,
  };

  galleryInput      = '';
  newFeature: CompoundFeature = this.emptyFeature();
  featureImageInput = '';
  showFeatureForm   = false;
  isSubmitting      = false;
  errorMessage      = '';

  translating = {
    nameToEn:          false, nameToAr:          false,
    descToEn:          false, descToAr:          false,
    featTitleToEn:     false, featTitleToAr:     false,
    featSubtitleToEn:  false, featSubtitleToAr:  false,
  };

  translateErrors = {
    nameToEn:          false, nameToAr:          false,
    descToEn:          false, descToAr:          false,
    featTitleToEn:     false, featTitleToAr:     false,
    featSubtitleToEn:  false, featSubtitleToAr:  false,
  };

  constructor(
    private compoundService:     CompoundService,
    private developerService:   DeveloperService,
    private areaService:        AreaService,
    private translationService: TranslationService,
    private router:             Router,
    private cdr:                ChangeDetectorRef,
  ) {
    this.loadDevelopers();
    this.areaService.getAll().subscribe({
      next: (res) => { this.areas = res.data.filter((a) => a.is_active); this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  loadDevelopers(): void {
    this.developerService.getAll(true).subscribe({
      next: (res) => { this.developers = res.data; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  // ── Compound name ──────────────────────────────────────────
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
    this.translationService.translate(this.form.name_en, 'en', 'ar').subscribe(r => {
      if (r !== null) this.form.name_ar = r; else this.translateErrors.nameToAr = true;
      this.translating.nameToAr = false; this.cdr.detectChanges();
    });
  }

  // ── Compound description ───────────────────────────────────
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

  // ── Feature title ─────────────────────────────────────────
  translateFeatTitleToEn(): void {
    if (!this.newFeature.title_ar?.trim() || this.translating.featTitleToEn) return;
    this.translating.featTitleToEn = true; this.translateErrors.featTitleToEn = false;
    this.translationService.translate(this.newFeature.title_ar, 'ar', 'en').subscribe(r => {
      if (r !== null) this.newFeature.title_en = r; else this.translateErrors.featTitleToEn = true;
      this.translating.featTitleToEn = false; this.cdr.detectChanges();
    });
  }

  translateFeatTitleToAr(): void {
    if (!this.newFeature.title_en?.trim() || this.translating.featTitleToAr) return;
    this.translating.featTitleToAr = true; this.translateErrors.featTitleToAr = false;
    this.translationService.translate(this.newFeature.title_en, 'en', 'ar').subscribe(r => {
      if (r !== null) this.newFeature.title_ar = r; else this.translateErrors.featTitleToAr = true;
      this.translating.featTitleToAr = false; this.cdr.detectChanges();
    });
  }

  // ── Feature subtitle ──────────────────────────────────────
  translateFeatSubtitleToEn(): void {
    if (!this.newFeature.subtitle_ar?.trim() || this.translating.featSubtitleToEn) return;
    this.translating.featSubtitleToEn = true; this.translateErrors.featSubtitleToEn = false;
    this.translationService.translate(this.newFeature.subtitle_ar, 'ar', 'en').subscribe(r => {
      if (r !== null) this.newFeature.subtitle_en = r; else this.translateErrors.featSubtitleToEn = true;
      this.translating.featSubtitleToEn = false; this.cdr.detectChanges();
    });
  }

  translateFeatSubtitleToAr(): void {
    if (!this.newFeature.subtitle_en?.trim() || this.translating.featSubtitleToAr) return;
    this.translating.featSubtitleToAr = true; this.translateErrors.featSubtitleToAr = false;
    this.translationService.translate(this.newFeature.subtitle_en, 'en', 'ar').subscribe(r => {
      if (r !== null) this.newFeature.subtitle_ar = r; else this.translateErrors.featSubtitleToAr = true;
      this.translating.featSubtitleToAr = false; this.cdr.detectChanges();
    });
  }

  // ── Gallery ───────────────────────────────────────────────
  addGalleryImage(): void {
    const val = this.galleryInput.trim();
    if (!val) return;
    this.form.gallery.push(val);
    this.galleryInput = '';
  }

  removeGalleryImage(index: number): void { this.form.gallery.splice(index, 1); }

  onGalleryKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addGalleryImage(); }
  }

  // ── Feature images ────────────────────────────────────────
  addFeatureImage(): void {
    const val = this.featureImageInput.trim();
    if (!val) return;
    this.newFeature.images.push(val);
    this.featureImageInput = '';
  }

  removeFeatureImage(index: number): void { this.newFeature.images.splice(index, 1); }

  onFeatureImageKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addFeatureImage(); }
  }

  // ── Feature CRUD ──────────────────────────────────────────
  private emptyFeature(): CompoundFeature {
    return { title_ar: '', title_en: '', subtitle_ar: '', subtitle_en: '', images: [] };
  }

  openFeatureForm(): void {
    this.newFeature        = this.emptyFeature();
    this.featureImageInput = '';
    this.showFeatureForm   = true;
    Object.keys(this.translateErrors).forEach(k => (this.translateErrors as any)[k] = false);
  }

  cancelFeature(): void { this.showFeatureForm = false; }

  addFeature(): void {
    if (!this.newFeature.title_ar && !this.newFeature.title_en) return;
    this.form.features.push({ ...this.newFeature, images: [...this.newFeature.images] });
    this.showFeatureForm   = false;
    this.featureImageInput = '';
  }

  removeFeature(index: number): void { this.form.features.splice(index, 1); }

  onMainImageUploaded(urls: string[]): void {
    if (urls.length) this.form.main_image = urls[0];
  }

  onGalleryUploaded(urls: string[]): void {
    urls.forEach(url => this.form.gallery.push(url));
  }

  onFeatureImagesUploaded(urls: string[]): void {
    urls.forEach(url => this.newFeature.images.push(url));
  }

  // ── Submit ────────────────────────────────────────────────
  onSubmit(): void {
    if (!this.form.developer_id) {
      this.errorMessage = 'Please select a developer.';
      return;
    }
    if (!this.form.name_ar.trim()) {
      this.errorMessage = 'Arabic name is required.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    this.compoundService.create(this.form).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/dashboard/compounds']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to create compound.';
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void { this.router.navigate(['/dashboard/compounds']); }
}
