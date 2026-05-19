import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NewsService } from '../../../../core/services/news.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { CreateNewsDto } from '../../../../core/models/news.model';
import { MediaUploaderComponent } from '../../../../shared/components/media-uploader/media-uploader';

@Component({
  selector: 'app-news-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUploaderComponent],
  templateUrl: './news-form.html',
  styleUrl: './news-form.scss',
})
export class NewsFormComponent {
  form: CreateNewsDto = {
    title_ar:     '',
    title_en:     '',
    content_ar:   '',
    content_en:   '',
    media:        [],
    is_active:    true,
    published_at: new Date().toISOString().slice(0, 16),
    published_by: '',
  };

  mediaInput   = '';
  isSubmitting = false;
  errorMessage = '';

  translating = { titleToEn: false, titleToAr: false, contentToEn: false, contentToAr: false };
  translateErrors = { titleToEn: false, titleToAr: false, contentToEn: false, contentToAr: false };

  constructor(
    private newsService: NewsService,
    private translationService: TranslationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  // ── Translation ───────────────────────────────────────────
  translateTitleToEn(): void {
    if (!this.form.title_ar?.trim() || this.translating.titleToEn) return;
    this.translating.titleToEn = true;
    this.translateErrors.titleToEn = false;
    this.translationService.translate(this.form.title_ar, 'ar', 'en').subscribe(result => {
      if (result !== null) this.form.title_en = result;
      else this.translateErrors.titleToEn = true;
      this.translating.titleToEn = false;
      this.cdr.detectChanges();
    });
  }

  translateTitleToAr(): void {
    if (!this.form.title_en?.trim() || this.translating.titleToAr) return;
    this.translating.titleToAr = true;
    this.translateErrors.titleToAr = false;
    this.translationService.translate(this.form.title_en, 'en', 'ar').subscribe(result => {
      if (result !== null) this.form.title_ar = result;
      else this.translateErrors.titleToAr = true;
      this.translating.titleToAr = false;
      this.cdr.detectChanges();
    });
  }

  translateContentToEn(): void {
    if (!this.form.content_ar?.trim() || this.translating.contentToEn) return;
    this.translating.contentToEn = true;
    this.translateErrors.contentToEn = false;
    this.translationService.translate(this.form.content_ar, 'ar', 'en').subscribe(result => {
      if (result !== null) this.form.content_en = result;
      else this.translateErrors.contentToEn = true;
      this.translating.contentToEn = false;
      this.cdr.detectChanges();
    });
  }

  translateContentToAr(): void {
    if (!this.form.content_en?.trim() || this.translating.contentToAr) return;
    this.translating.contentToAr = true;
    this.translateErrors.contentToAr = false;
    this.translationService.translate(this.form.content_en, 'en', 'ar').subscribe(result => {
      if (result !== null) this.form.content_ar = result;
      else this.translateErrors.contentToAr = true;
      this.translating.contentToAr = false;
      this.cdr.detectChanges();
    });
  }

  // ── Media helpers ─────────────────────────────────────────
  isVideo(url: string): boolean {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  }

  addMedia(): void {
    const val = this.mediaInput.trim();
    if (!val) return;
    this.form.media.push(val);
    this.mediaInput = '';
  }

  removeMedia(index: number): void {
    this.form.media.splice(index, 1);
  }

  onMediaKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addMedia(); }
  }

  onMediaUploaded(urls: string[]): void {
    urls.forEach(url => this.form.media.push(url));
  }

  // ── Submit ────────────────────────────────────────────────
  onSubmit(): void {
    if (!this.form.title_ar?.trim() && !this.form.title_en?.trim()) {
      this.errorMessage = 'At least one title (Arabic or English) is required.';
      return;
    }
    if (!this.form.content_ar?.trim() && !this.form.content_en?.trim()) {
      this.errorMessage = 'At least one content (Arabic or English) is required.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload: CreateNewsDto = {
      title_ar:   this.form.title_ar?.trim()   || null,
      title_en:   this.form.title_en?.trim()   || null,
      content_ar: this.form.content_ar?.trim() || null,
      content_en: this.form.content_en?.trim() || null,
      media:        this.form.media,
      is_active:    this.form.is_active,
      published_at: this.form.published_at,
      published_by: this.form.published_by,
    };

    this.newsService.create(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/dashboard/news']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to create article.';
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/news']);
  }
}
