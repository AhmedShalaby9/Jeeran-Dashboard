import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NewsService } from '../../../../core/services/news.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { News, CreateNewsDto } from '../../../../core/models/news.model';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './news-detail.html',
  styleUrl: './news-detail.scss',
})
export class NewsDetailComponent implements OnInit {
  article: News | null = null;
  isLoading       = false;
  isEditMode      = false;
  isSubmitting    = false;
  isDeleting      = false;
  showDeleteModal = false;
  errorMessage    = '';
  successMessage  = '';
  mediaInput      = '';

  translating = { titleToAr: false, titleToEn: false, contentToAr: false, contentToEn: false };
  translateErrors = { title: false, content: false };

  editForm: CreateNewsDto = {
    title:        '',
    content:      '',
    media:        [],
    is_active:    true,
    published_at: '',
    published_by: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsService: NewsService,
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef,
  ) {}

  translateTitle(to: 'ar' | 'en'): void {
    const text = this.editForm.title?.trim();
    if (!text) return;
    const from = to === 'ar' ? 'en' : 'ar';
    const key  = to === 'ar' ? 'titleToAr' : 'titleToEn';
    if (this.translating[key]) return;
    this.translating[key] = true;
    this.translateErrors.title = false;
    this.translationService.translate(text, from, to).subscribe(result => {
      if (result !== null) this.editForm.title = result;
      else this.translateErrors.title = true;
      this.translating[key] = false;
      this.cdr.detectChanges();
    });
  }

  translateContent(to: 'ar' | 'en'): void {
    const text = this.editForm.content?.trim();
    if (!text) return;
    const from = to === 'ar' ? 'en' : 'ar';
    const key  = to === 'ar' ? 'contentToAr' : 'contentToEn';
    if (this.translating[key]) return;
    this.translating[key] = true;
    this.translateErrors.content = false;
    this.translationService.translate(text, from, to).subscribe(result => {
      if (result !== null) this.editForm.content = result;
      else this.translateErrors.content = true;
      this.translating[key] = false;
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadArticle(id);
  }

  loadArticle(id: number): void {
    this.isLoading = true;
    this.newsService.getById(id).subscribe({
      next: (res) => {
        this.article   = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard/news']);
      },
    });
  }

  isVideo(url: string): boolean {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  }

  enableEdit(): void {
    if (!this.article) return;
    this.editForm = {
      title:        this.article.title,
      content:      this.article.content,
      media:        [...(this.article.media || [])],
      is_active:    this.article.is_active,
      published_at: this.article.published_at
        ? this.article.published_at.slice(0, 16)
        : '',
      published_by: this.article.published_by,
    };
    this.errorMessage = '';
    this.isEditMode   = true;
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.isEditMode   = false;
    this.errorMessage = '';
    this.mediaInput   = '';
  }

  // ── Media helpers for edit form ────────────────────────────
  addMedia(): void {
    const val = this.mediaInput.trim();
    if (!val) return;
    this.editForm.media.push(val);
    this.mediaInput = '';
  }

  removeMedia(index: number): void {
    this.editForm.media.splice(index, 1);
  }

  onMediaKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addMedia(); }
  }

  // ── Save / Delete ──────────────────────────────────────────
  saveEdit(): void {
    if (!this.editForm.title || !this.editForm.content) {
      this.errorMessage = 'Title and content are required.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    this.newsService.update(this.article!.id, this.editForm).subscribe({
      next: (res) => {
        this.article        = res.data;
        this.isSubmitting   = false;
        this.isEditMode     = false;
        this.successMessage = 'Article updated successfully!';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to update article.';
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

  deleteArticle(): void {
    this.isDeleting = true;
    this.newsService.remove(this.article!.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.router.navigate(['/dashboard/news']);
      },
      error: () => {
        this.isDeleting      = false;
        this.showDeleteModal = false;
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/news']);
  }
}
