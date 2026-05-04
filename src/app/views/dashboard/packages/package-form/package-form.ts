import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PackageService } from '../../../../core/services/package.service';
import { CreatePackageDto } from '../../../../core/models/package.model';

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
    features:           [],
  };

  featureInput = '';
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private packageService: PackageService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

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
    if (!this.form.price || !this.form.duration_days) {
      this.errorMessage = 'Price and duration are required.';
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
