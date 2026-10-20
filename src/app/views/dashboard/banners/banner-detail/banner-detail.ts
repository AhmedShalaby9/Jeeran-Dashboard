import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BannerService } from '../../../../core/services/banner.service';
import { AdStudioService } from '../../../../core/services/ad-studio.service';
import { Banner, CreateBannerDto, BANNER_SLOTS, BANNER_STATUS_LABEL, BANNER_TARGETS, bannerPayload, bannerStatus, bannerToForm, emptyBannerForm, isStudioAd } from '../../../../core/models/banner.model';
import { DeveloperService } from '../../../../core/services/developer.service';
import { Developer } from '../../../../core/models/developer.model';
import { BannerFieldsComponent } from '../../../../shared/components/banner-fields/banner-fields';

@Component({
  selector: 'app-banner-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, BannerFieldsComponent],
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

  editForm: CreateBannerDto = emptyBannerForm();
  developers: Developer[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bannerService: BannerService,
    private adStudio: AdStudioService,
    private developerService: DeveloperService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadBanner(id);
    this.developerService.getAll(true).subscribe({
      next: (res) => { this.developers = res.data; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  isApproving = false;
  staleWarning = false;

  get status(): string { return this.banner ? bannerStatus(this.banner) : ''; }
  get statusLabel(): string { return this.banner ? BANNER_STATUS_LABEL[bannerStatus(this.banner)] : ''; }
  get isStudio(): boolean { return !!this.banner && isStudioAd(this.banner); }

  /** Approves the new numbers of a paused ad: the matching text is updated and the ad runs again. */
  approveNumbers(): void {
    if (!this.banner || this.isApproving) return;
    this.isApproving = true;
    this.errorMessage = '';
    this.adStudio.approve(this.banner.id).subscribe({
      next: (res) => {
        this.banner = res.data.banner;
        this.staleWarning = res.data.stale;
        this.isApproving = false;
        this.successMessage = res.data.stale ? 'Approved, but the text still has an old number. Edit it.' : 'Approved. The ad is live again.';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 4000);
      },
      error: (err) => {
        this.isApproving = false;
        this.errorMessage = err.error?.message || 'Could not approve the new numbers.';
        this.cdr.detectChanges();
      },
    });
  }

  slotLabel(v: string): string { return BANNER_SLOTS.find((s) => s.value === v)?.label ?? v; }
  targetLabel(v: string): string { return BANNER_TARGETS.find((t) => t.value === v)?.label ?? v; }

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
    this.editForm = bannerToForm(this.banner);
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
      this.errorMessage = 'An image is required (it is also the poster for video banners).';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    this.bannerService.update(this.banner!.id, bannerPayload(this.editForm)).subscribe({
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
