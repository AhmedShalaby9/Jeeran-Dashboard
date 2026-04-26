import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BannerService } from '../../../../core/services/banner.service';
import { CreateBannerDto } from '../../../../core/models/banner.model';
import { MediaUploaderComponent } from '../../../../shared/components/media-uploader/media-uploader';

@Component({
  selector: 'app-banner-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUploaderComponent],
  templateUrl: './banner-form.html',
  styleUrl: './banner-form.scss',
})
export class BannerFormComponent {
  form: CreateBannerDto = {
    image_url: '',
    link:      '',
    phone:     '',
    is_active: true,
  };

  isSubmitting = false;
  errorMessage = '';

  constructor(
    private bannerService: BannerService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  onSubmit(): void {
    if (!this.form.image_url.trim()) {
      this.errorMessage = 'Desktop image URL is required.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.bannerService.create(this.form).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/dashboard/banners']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to create banner.';
        this.cdr.detectChanges();
      },
    });
  }

  onImageUploaded(urls: string[]): void {
    if (urls.length) this.form.image_url = urls[0];
  }

  goBack(): void {
    this.router.navigate(['/dashboard/banners']);
  }
}
