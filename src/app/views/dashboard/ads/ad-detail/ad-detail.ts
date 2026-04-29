import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdService } from '../../../../core/services/ad.service';
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
    title: '',
    name: '',
    description: '',
    images: [],
    phone_number: '',
    whatsapp_number: '',
    is_active: true,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adService: AdService,
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
      title: this.ad.title,
      name: this.ad.name,
      description: this.ad.description,
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
    if (!this.editForm.title || !this.editForm.name || !this.editForm.description) {
      this.errorMessage = 'Title, name, and description are required.';
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
