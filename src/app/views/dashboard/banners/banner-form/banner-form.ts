import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BannerService } from '../../../../core/services/banner.service';
import { DeveloperService } from '../../../../core/services/developer.service';
import { Developer } from '../../../../core/models/developer.model';
import { CreateBannerDto, bannerPayload, emptyBannerForm } from '../../../../core/models/banner.model';
import { BannerFieldsComponent } from '../../../../shared/components/banner-fields/banner-fields';

@Component({
  selector: 'app-banner-form',
  standalone: true,
  imports: [CommonModule, FormsModule, BannerFieldsComponent],
  templateUrl: './banner-form.html',
  styleUrl: './banner-form.scss',
})
export class BannerFormComponent implements OnInit {
  form: CreateBannerDto = emptyBannerForm();
  developers: Developer[] = [];

  isSubmitting = false;
  errorMessage = '';

  constructor(
    private bannerService: BannerService,
    private developerService: DeveloperService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.developerService.getAll(true).subscribe({
      next: (res) => { this.developers = res.data; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  onSubmit(): void {
    if (!this.form.image_url.trim()) {
      this.errorMessage = 'An image is required (it is also the poster for video banners).';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.bannerService.create(bannerPayload(this.form)).subscribe({
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

  goBack(): void {
    this.router.navigate(['/dashboard/banners']);
  }
}
