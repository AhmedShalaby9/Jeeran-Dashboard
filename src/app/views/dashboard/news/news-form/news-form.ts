import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NewsService } from '../../../../core/services/news.service';
import { CreateNewsDto } from '../../../../core/models/news.model';

@Component({
  selector: 'app-news-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(
    private newsService: NewsService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

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
