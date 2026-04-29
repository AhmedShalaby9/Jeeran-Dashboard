import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdService } from '../../../../core/services/ad.service';
import { CreateAdDto } from '../../../../core/models/ad.model';
import { MediaUploaderComponent } from '../../../../shared/components/media-uploader/media-uploader';

@Component({
  selector: 'app-ad-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUploaderComponent],
  templateUrl: './ad-form.html',
  styleUrl: './ad-form.scss',
})
export class AdFormComponent {
  form: CreateAdDto = {
    title: '',
    name: '',
    description: '',
    images: [],
    phone_number: '',
    whatsapp_number: '',
    is_active: true,
  };

  imageInput = '';
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private adService: AdService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  addImage(): void {
    const val = this.imageInput.trim();
    if (!val) return;
    this.form.images.push(val);
    this.imageInput = '';
  }

  removeImage(index: number): void {
    this.form.images.splice(index, 1);
  }

  onImageKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addImage(); }
  }

  onImagesUploaded(urls: string[]): void {
    urls.forEach(url => this.form.images.push(url));
  }

  onSubmit(): void {
    if (!this.form.title || !this.form.name || !this.form.description) {
      this.errorMessage = 'Title, name, and description are required.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.adService.create(this.form).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/dashboard/ads']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to create ad.';
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/ads']);
  }
}
