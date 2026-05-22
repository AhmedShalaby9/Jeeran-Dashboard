import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AiAdService } from '../../../../core/services/ai-ad.service';
import { MediaUploaderComponent } from '../../../../shared/components/media-uploader/media-uploader';

@Component({
  selector: 'app-ai-ad-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUploaderComponent],
  templateUrl: './ai-ad-form.html',
  styleUrl: './ai-ad-form.scss',
})
export class AiAdFormComponent {
  caption      = '';
  sourceImages: string[] = [];
  imageInput   = '';
  language: 'ar' | 'en' = 'ar';

  isSubmitting = false;
  errorMessage = '';

  constructor(
    private aiAdService: AiAdService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  onImagesUploaded(urls: string[]): void {
    urls.forEach(url => this.sourceImages.push(url));
  }

  addImageUrl(): void {
    const val = this.imageInput.trim();
    if (!val) return;
    this.sourceImages.push(val);
    this.imageInput = '';
  }

  onImageKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addImageUrl(); }
  }

  removeImage(index: number): void {
    this.sourceImages.splice(index, 1);
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.caption.trim()) {
      this.errorMessage = 'Caption / instructions are required.';
      return;
    }
    if (this.sourceImages.length === 0) {
      this.errorMessage = 'At least one source image is required.';
      return;
    }

    this.isSubmitting = true;

    this.aiAdService.adminGenerate({
      source_images: this.sourceImages,
      caption: this.caption.trim(),
      language: this.language,
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/dashboard/ai-ads']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Failed to generate AI ad.';
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/ai-ads']);
  }
}
