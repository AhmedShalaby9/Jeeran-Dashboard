import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdService } from '../../../../core/services/ad.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { Ad, CreateAdDto } from '../../../../core/models/ad.model';

@Component({
  selector: 'app-ad-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ad-detail.html',
  styleUrl: './ad-detail.scss',
})
export class AdDetailComponent implements OnInit {
  ad: Ad | null = null;
  isLoading = false;
  isEditMode = false;
  isSubmitting = false;
  isDeleting = false;
  showDeleteModal = false;
  errorMessage = '';
  successMessage = '';
  imageInput = '';

  editForm: CreateAdDto = {
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
    private route: ActivatedRoute,
    private router: Router,
    private adService: AdService,
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAd(id);
  }

  loadAd(id: number): void {
    this.isLoading = true;
    this.adService.getById(id).subscribe({
      next: (res) => {
        this.ad = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard/ads']);
      },
    });
  }

  enableEdit(): void {
    if (!this.ad) return;
    this.editForm = {
      title_en: this.ad.title_en || '',
      title_ar: this.ad.title_ar || '',
      name_en: this.ad.name_en || '',
      name_ar: this.ad.name_ar || '',
      description_en: this.ad.description_en || '',
      description_ar: this.ad.description_ar || '',
      images: [...(this.ad.images || [])],
      phone_number: this.ad.phone_number,
      whatsapp_number: this.ad.whatsapp_number,
      is_active: this.ad.is_active,
    };
    this.errorMessage = '';
    this.isEditMode = true;
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.errorMessage = '';
    this.imageInput = '';
  }

  // ── Translation ───────────────────────────────────────────
  translateTitleToEn(): void {
    if (!this.editForm.title_ar?.trim() || this.translating.titleToEn) return;
    this.translating.titleToEn = true;
    this.translateErrors.titleToEn = false;
    this.translationService.translate(this.editForm.title_ar, 'ar', 'en').subscribe(result => {
      if (result !== null) this.editForm.title_en = result;
      else this.translateErrors.titleToEn = true;
      this.translating.titleToEn = false;
      this.cdr.detectChanges();
    });
  }

  translateTitleToAr(): void {
    if (!this.editForm.title_en?.trim() || this.translating.titleToAr) return;
    this.translating.titleToAr = true;
    this.translateErrors.titleToAr = false;
    this.translationService.translate(this.editForm.title_en, 'en', 'ar').subscribe(result => {
      if (result !== null) this.editForm.title_ar = result;
      else this.translateErrors.titleToAr = true;
      this.translating.titleToAr = false;
      this.cdr.detectChanges();
    });
  }

  translateNameToEn(): void {
    if (!this.editForm.name_ar?.trim() || this.translating.nameToEn) return;
    this.translating.nameToEn = true;
    this.translateErrors.nameToEn = false;
    this.translationService.translate(this.editForm.name_ar, 'ar', 'en').subscribe(result => {
      if (result !== null) this.editForm.name_en = result;
      else this.translateErrors.nameToEn = true;
      this.translating.nameToEn = false;
      this.cdr.detectChanges();
    });
  }

  translateNameToAr(): void {
    if (!this.editForm.name_en?.trim() || this.translating.nameToAr) return;
    this.translating.nameToAr = true;
    this.translateErrors.nameToAr = false;
    this.translationService.translate(this.editForm.name_en, 'en', 'ar').subscribe(result => {
      if (result !== null) this.editForm.name_ar = result;
      else this.translateErrors.nameToAr = true;
      this.translating.nameToAr = false;
      this.cdr.detectChanges();
    });
  }

  translateDescToEn(): void {
    if (!this.editForm.description_ar?.trim() || this.translating.descToEn) return;
    this.translating.descToEn = true;
    this.translateErrors.descToEn = false;
    this.translationService.translate(this.editForm.description_ar, 'ar', 'en').subscribe(result => {
      if (result !== null) this.editForm.description_en = result;
      else this.translateErrors.descToEn = true;
      this.translating.descToEn = false;
      this.cdr.detectChanges();
    });
  }

  translateDescToAr(): void {
    if (!this.editForm.description_en?.trim() || this.translating.descToAr) return;
    this.translating.descToAr = true;
    this.translateErrors.descToAr = false;
    this.translationService.translate(this.editForm.description_en, 'en', 'ar').subscribe(result => {
      if (result !== null) this.editForm.description_ar = result;
      else this.translateErrors.descToAr = true;
      this.translating.descToAr = false;
      this.cdr.detectChanges();
    });
  }

  // ── Image helpers for edit form ────────────────────────────
  addImage(): void {
    const val = this.imageInput.trim();
    if (!val) return;
    this.editForm.images.push(val);
    this.imageInput = '';
  }

  removeImage(index: number): void {
    this.editForm.images.splice(index, 1);
  }

  onImageKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addImage(); }
  }

  // ── Save / Delete ──────────────────────────────────────────
  saveEdit(): void {
    if (!this.editForm.title_en?.trim()) {
      this.errorMessage = 'Title (English) is required.';
      return;
    }
    if (!this.editForm.name_en?.trim()) {
      this.errorMessage = 'Name (English) is required.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    this.adService.update(this.ad!.id, this.editForm).subscribe({
      next: (res) => {
        this.ad = res.data;
        this.isSubmitting = false;
        this.isEditMode = false;
        this.successMessage = 'Ad updated successfully!';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to update ad.';
        this.cdr.detectChanges();
      },
    });
  }

  confirmDelete(): void {
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
  }

  deleteAd(): void {
    this.isDeleting = true;
    this.adService.remove(this.ad!.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.router.navigate(['/dashboard/ads']);
      },
      error: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/ads']);
  }
}
