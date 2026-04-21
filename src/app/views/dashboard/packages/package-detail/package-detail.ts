import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PackageService } from '../../../../core/services/package.service';
import { Package, CreatePackageDto } from '../../../../core/models/package.model';

@Component({
  selector: 'app-package-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './package-detail.html',
  styleUrl: './package-detail.scss',
})
export class PackageDetailComponent implements OnInit {
  pkg: Package | null = null;
  isLoading       = false;
  isEditMode      = false;
  isSubmitting    = false;
  isDeleting      = false;
  showDeleteModal = false;
  errorMessage    = '';
  successMessage  = '';
  featureInput    = '';

  editForm: CreatePackageDto = {
    name: '', price: 0, duration_days: 30,
    description: '', available_listings: 0, features: [],
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private packageService: PackageService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPackage(id);
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

  enableEdit(): void {
    if (!this.pkg) return;
    this.editForm = {
      name:               this.pkg.name,
      price:              parseFloat(this.pkg.price),
      duration_days:      this.pkg.duration_days,
      description:        this.pkg.description,
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
    if (!this.editForm.name || !this.editForm.price || !this.editForm.duration_days) {
      this.errorMessage = 'Name, price, and duration are required.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    this.packageService.update(this.pkg!.id, this.editForm).subscribe({
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

  confirmDelete(): void {
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
  }

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
