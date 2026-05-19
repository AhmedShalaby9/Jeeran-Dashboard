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

  translating = { titleToEn: false, titleToAr: false, contentToEn: false, contentToAr: false };
  translateErrors = { titleToEn: false, titleToAr: false, contentToEn: false, contentToAr: false };

  editForm: CreateNewsDto = {
    title_ar:     '',
    title_en:     '',
    content_ar:   '',
    content_en:   '',
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

  // ── Translation ───────────────────────────────────────────
  translateTitleToEn(): void {
    if (!this.editForm.title_ar?.trim() || this.translating.titleToEn) return;
    this.translating.titleToEn = true;
    this.translateErrors.titleToEn = false;
    this.translationService.translate(this.editForm.title_ar, 'ar', 'en').subscribe(result => {
      if (result !== null) this.editForm.title_en = result;
      else this.translateErrors.titleToEn = true;
      this.translating.titleToEn = false;
      this.cdr.detectChanges();
    });
  }

  translateTitleToAr(): void {
    if (!this.editForm.title_en?.trim() || this.translating.titleToAr) return;
    this.translating.titleToAr = true;
    this.translateErrors.titleToAr = false;
    this.translationService.translate(this.editForm.title_en, 'en', 'ar').subscribe(result => {
      if (result !== null) this.editForm.title_ar = result;
      else this.translateErrors.titleToAr = true;
      this.translating.titleToAr = false;
      this.cdr.detectChanges();
    });
  }

  translateContentToEn(): void {
    if (!this.editForm.content_ar?.trim() || this.translating.contentToEn) return;
    this.translating.contentToEn = true;
    this.translateErrors.contentToEn = false;
    this.translationService.translate(this.editForm.content_ar, 'ar', 'en').subscribe(result => {
      if (result !== null) this.editForm.content_en = result;
      else this.translateErrors.contentToEn = true;
      this.translating.contentToEn = false;
      this.cdr.detectChanges();
    });
  }

  translateContentToAr(): void {
    if (!this.editForm.content_en?.trim() || this.translating.contentToAr) return;
    this.translating.contentToAr = true;
    this.translateErrors.contentToAr = false;
    this.translationService.translate(this.editForm.content_en, 'en', 'ar').subscribe(result => {
      if (result !== null) this.editForm.content_ar = result;
      else this.translateErrors.contentToAr = true;
      this.translating.contentToAr = false;
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
      title_ar:     this.article.title_ar || '',
      title_en:     this.article.title_en || '',
      content_ar:   this.article.content_ar || '',
      content_en:   this.article.content_en || '',
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
    if (!this.editForm.title_ar?.trim() && !this.editForm.title_en?.trim()) {
      this.errorMessage = 'At least one title (Arabic or English) is required.';
      return;
    }
    if (!this.editForm.content_ar?.trim() && !this.editForm.content_en?.trim()) {
      this.errorMessage = 'At least one content (Arabic or English) is required.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload: CreateNewsDto = {
      title_ar:   this.editForm.title_ar?.trim()   || null,
      title_en:   this.editForm.title_en?.trim()   || null,
      content_ar: this.editForm.content_ar?.trim() || null,
      content_en: this.editForm.content_en?.trim() || null,
      media:        this.editForm.media,
      is_active:    this.editForm.is_active,
      published_at: this.editForm.published_at,
      published_by: this.editForm.published_by,
    };

    this.newsService.update(this.article!.id, payload).subscribe({
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
