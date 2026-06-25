import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PackageService } from '../../../../core/services/package.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { Package, CreatePackageDto } from '../../../../core/models/package.model';
import { LangService, Lang } from '../../../../core/services/lang.service';

@Component({
  selector: 'app-package-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './package-detail.html',
  styleUrl: './package-detail.scss',
})
export class PackageDetailComponent implements OnInit, OnDestroy {
  pkg: Package | null = null;
  isLoading       = false;
  isEditMode      = false;
  isSubmitting    = false;
  isDeleting      = false;
  showDeleteModal = false;
  errorMessage    = '';
  successMessage  = '';

  featureInputEn = '';
  featureInputAr = '';

  lang: Lang = 'en';
  private langSub!: Subscription;

  editForm: CreatePackageDto = {
    title_en: '', title_ar: '',
    price: 0, duration_days: 30,
    description_en: '', description_ar: '',
    available_listings: 0, featured_listings: 0, features: [],
  };

  translating = {
    titleToEn: false, titleToAr: false,
    descToEn:  false, descToAr:  false,
    featureToEn: false, featureToAr: false,
  };

  translateErrors = {
    titleToEn: false, titleToAr: false,
    descToEn:  false, descToAr:  false,
    featureToEn: false, featureToAr: false,
  };

  constructor(
    private route:              ActivatedRoute,
    private router:             Router,
    private packageService:     PackageService,
    private translationService: TranslationService,
    private cdr:                ChangeDetectorRef,
    private langService:        LangService,
  ) {}

  ngOnInit(): void {
    this.lang = this.langService.lang;
    this.langSub = this.langService.lang$.subscribe(l => {
      this.lang = l;
      this.cdr.detectChanges();
    });
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPackage(id);
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  loadPackage(id: number): void {
    this.isLoading = true;
    this.packageService.getById(id).subscribe({
      next: (res) => {
        this.pkg       = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard/packages']);
      },
    });
  }

  pkgTitle(pkg: Package): string {
    return (this.lang === 'ar' ? pkg.title_ar : pkg.title_en) || pkg.title_en || pkg.title_ar || '—';
  }

  pkgDesc(pkg: Package): string {
    return (this.lang === 'ar' ? pkg.description_ar : pkg.description_en) || '—';
  }

  enableEdit(): void {
    if (!this.pkg) return;
    this.editForm = {
      title_en:           this.pkg.title_en           ?? '',
      title_ar:           this.pkg.title_ar           ?? '',
      price:              parseFloat(this.pkg.price),
      duration_days:      this.pkg.duration_days,
      description_en:     this.pkg.description_en     ?? '',
      description_ar:     this.pkg.description_ar     ?? '',
      available_listings: this.pkg.available_listings,
      featured_listings:  this.pkg.featured_listings,
      features:           (this.pkg.features || []).map(f =>
        typeof f === 'string' ? { en: f as string, ar: '' } : { ...f }
      ),
    };
    this.featureInputEn = '';
    this.featureInputAr = '';
    this.errorMessage   = '';
    this.isEditMode     = true;
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.isEditMode   = false;
    this.errorMessage = '';
    this.featureInputEn = '';
    this.featureInputAr = '';
  }

  // ── Title translation ─────────────────────────────────────
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

  // ── Description translation ───────────────────────────────
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

  // ── Feature pending-input translation ─────────────────────
  translateFeatureToEn(): void {
    if (!this.featureInputAr.trim() || this.translating.featureToEn) return;
    this.translating.featureToEn = true;
    this.translateErrors.featureToEn = false;
    this.translationService.translate(this.featureInputAr, 'ar', 'en').subscribe(result => {
      if (result !== null) this.featureInputEn = result;
      else this.translateErrors.featureToEn = true;
      this.translating.featureToEn = false;
      this.cdr.detectChanges();
    });
  }

  translateFeatureToAr(): void {
    if (!this.featureInputEn.trim() || this.translating.featureToAr) return;
    this.translating.featureToAr = true;
    this.translateErrors.featureToAr = false;
    this.translationService.translate(this.featureInputEn, 'en', 'ar').subscribe(result => {
      if (result !== null) this.featureInputAr = result;
      else this.translateErrors.featureToAr = true;
      this.translating.featureToAr = false;
      this.cdr.detectChanges();
    });
  }

  // ── Feature list helpers ──────────────────────────────────
  addFeature(): void {
    const en = this.featureInputEn.trim();
    const ar = this.featureInputAr.trim();
    if (!en && !ar) return;
    if (!this.editForm.features) this.editForm.features = [];
    this.editForm.features.push({ en, ar });
    this.featureInputEn = '';
    this.featureInputAr = '';
    this.translateErrors.featureToEn = false;
    this.translateErrors.featureToAr = false;
  }

  removeFeature(index: number): void {
    this.editForm.features?.splice(index, 1);
  }

  onFeatureKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addFeature(); }
  }

  // ── Save / Delete ──────────────────────────────────────────
  saveEdit(): void {
    if (!this.editForm.title_en?.trim() && !this.editForm.title_ar?.trim()) {
      this.errorMessage = 'At least one title (English or Arabic) is required.';
      return;
    }
    if (!this.editForm.duration_days) {
      this.errorMessage = 'Duration is required.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    const payload: CreatePackageDto = {
      ...this.editForm,
      title_en:       this.editForm.title_en?.trim()       || '',
      title_ar:       this.editForm.title_ar?.trim()       || '',
      description_en: this.editForm.description_en?.trim() || null,
      description_ar: this.editForm.description_ar?.trim() || null,
    };

    this.packageService.update(this.pkg!.id, payload).subscribe({
      next: (res) => {
        this.pkg            = res.data;
        this.isSubmitting   = false;
        this.isEditMode     = false;
        this.successMessage = 'Package updated successfully!';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to update package.';
        this.cdr.detectChanges();
      },
    });
  }

  confirmDelete(): void  { this.showDeleteModal = true; }
  cancelDelete(): void   { this.showDeleteModal = false; }

  deletePackage(): void {
    this.isDeleting = true;
    this.packageService.remove(this.pkg!.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.router.navigate(['/dashboard/packages']);
      },
      error: () => {
        this.isDeleting      = false;
        this.showDeleteModal = false;
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/packages']);
  }
}
