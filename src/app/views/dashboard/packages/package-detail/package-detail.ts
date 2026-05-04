import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PackageService } from '../../../../core/services/package.service';
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
  featureInput    = '';

  lang: Lang = 'en';
  private langSub!: Subscription;

  editForm: CreatePackageDto = {
    title_en: '', title_ar: '',
    price: 0, duration_days: 30,
    description_en: '', description_ar: '',
    available_listings: 0, features: [],
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private packageService: PackageService,
    private cdr: ChangeDetectorRef,
    private langService: LangService,
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
      features:           [...(this.pkg.features || [])],
    };
    this.errorMessage = '';
    this.isEditMode   = true;
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.isEditMode   = false;
    this.errorMessage = '';
  }

  addFeature(): void {
    const val = this.featureInput.trim();
    if (!val) return;
    if (!this.editForm.features) this.editForm.features = [];
    this.editForm.features.push(val);
    this.featureInput = '';
  }

  removeFeature(index: number): void {
    this.editForm.features?.splice(index, 1);
  }

  onFeatureKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addFeature(); }
  }

  saveEdit(): void {
    if (!this.editForm.title_en?.trim() && !this.editForm.title_ar?.trim()) {
      this.errorMessage = 'At least one title (English or Arabic) is required.';
      return;
    }
    if (!this.editForm.price || !this.editForm.duration_days) {
      this.errorMessage = 'Price and duration are required.';
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
