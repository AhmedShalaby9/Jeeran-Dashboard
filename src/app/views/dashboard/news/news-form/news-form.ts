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
    title:        '',
    content:      '',
    media:        [],
    is_active:    true,
    published_at: new Date().toISOString().slice(0, 16),
    published_by: '',
  };

  mediaInput  = '';
  isSubmitting = false;
  errorMessage = '';

  translating = { titleToAr: false, titleToEn: false, contentToAr: false, contentToEn: false };
  translateErrors = { title: false, content: false };

  constructor(
    private newsService: NewsService,
    private translationService: TranslationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  translateTitle(to: 'ar' | 'en'): void {
    const text = this.form.title?.trim();
    if (!text) return;
    const from = to === 'ar' ? 'en' : 'ar';
    const key  = to === 'ar' ? 'titleToAr' : 'titleToEn';
    if (this.translating[key]) return;
    this.translating[key] = true;
    this.translateErrors.title = false;
    this.translationService.translate(text, from, to).subscribe(result => {
      if (result !== null) this.form.title = result;
      else this.translateErrors.title = true;
      this.translating[key] = false;
      this.cdr.detectChanges();
    });
  }

  translateContent(to: 'ar' | 'en'): void {
    const text = this.form.content?.trim();
    if (!text) return;
    const from = to === 'ar' ? 'en' : 'ar';
    const key  = to === 'ar' ? 'contentToAr' : 'contentToEn';
    if (this.translating[key]) return;
    this.translating[key] = true;
    this.translateErrors.content = false;
    this.translationService.translate(text, from, to).subscribe(result => {
      if (result !== null) this.form.content = result;
      else this.translateErrors.content = true;
      this.translating[key] = false;
      this.cdr.detectChanges();
    });
  }

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

  onSubmit(): void {
    if (!this.form.title || !this.form.content) {
      this.errorMessage = 'Title and content are required.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.newsService.create(this.form).subscribe({
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
