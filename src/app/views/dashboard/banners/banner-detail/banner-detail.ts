import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BannerService } from '../../../../core/services/banner.service';
import { Banner, CreateBannerDto } from '../../../../core/models/banner.model';

@Component({
  selector: 'app-banner-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './banner-detail.html',
  styleUrl: './banner-detail.scss',
})
export class BannerDetailComponent implements OnInit {
  banner: Banner | null = null;
  isLoading       = false;
  isEditMode      = false;
  isSubmitting    = false;
  isDeleting      = false;
  showDeleteModal = false;
  errorMessage    = '';
  successMessage  = '';

  editForm: CreateBannerDto = {
    image_url: '',
    link:      '',
    phone:     '',
    is_active: true,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bannerService: BannerService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadBanner(id);
  }

  loadBanner(id: number): void {
    this.isLoading = true;
    this.bannerService.getById(id).subscribe({
      next: (res) => {
        this.banner    = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard/banners']);
      },
    });
  }

  enableEdit(): void {
    if (!this.banner) return;
    this.editForm = {
      image_url: this.banner.image_url,
      link:      this.banner.link  || '',
      phone:     this.banner.phone || '',
      is_active: this.banner.is_active,
    };
    this.errorMessage = '';
    this.isEditMode   = true;
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.isEditMode   = false;
    this.errorMessage = '';
  }

  saveEdit(): void {
    if (!this.editForm.image_url.trim()) {
      this.errorMessage = 'Desktop image URL is required.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    this.bannerService.update(this.banner!.id, this.editForm).subscribe({
      next: (res) => {
        this.banner         = res.data;
        this.isSubmitting   = false;
        this.isEditMode     = false;
        this.successMessage = 'Banner updated successfully!';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to update banner.';
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

  deleteBanner(): void {
    this.isDeleting = true;
    this.bannerService.remove(this.banner!.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.router.navigate(['/dashboard/banners']);
      },
      error: () => {
        this.isDeleting      = false;
        this.showDeleteModal = false;
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/banners']);
  }
}
