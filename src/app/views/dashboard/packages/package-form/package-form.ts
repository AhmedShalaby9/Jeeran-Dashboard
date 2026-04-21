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
    name: '',
    price: 0,
    duration_days: 30,
    description: '',
    available_listings: 0,
    features: [],
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
    if (!this.form.name || !this.form.price || !this.form.duration_days) {
      this.errorMessage = 'Name, price, and duration are required.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.packageService.create(this.form).subscribe({
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
