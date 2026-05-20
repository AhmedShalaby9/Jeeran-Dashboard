import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiAdService } from '../../../core/services/ai-ad.service';
import { AiAd } from '../../../core/models/ai-ad.model';

@Component({
  selector: 'app-ai-ads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-ads.html',
  styleUrl: './ai-ads.scss',
})
export class AiAdsComponent implements OnInit {
  ads: AiAd[] = [];
  isLoading = false;

  // Filters
  filterStatus         = '';
  filterPaymentStatus  = '';
  filterUserId         = '';

  // Pagination
  page  = 1;
  limit = 20;
  total = 0;
  pages = 1;

  // Detail modal
  selected: AiAd | null = null;

  // Generate modal
  showGenerateModal = false;
  genUserId        = '';
  genCaption       = '';
  genImagesRaw     = '';   // comma-separated URLs entered by admin
  genLoading       = false;
  genError         = '';
  genSuccess       = '';

  constructor(private aiAdService: AiAdService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.aiAdService.adminList({
      status:         this.filterStatus         || undefined,
      payment_status: this.filterPaymentStatus  || undefined,
      user_id:        this.filterUserId         || undefined,
      page:           this.page,
      limit:          this.limit,
    }).subscribe({
      next: (res) => {
        this.ads      = res.data;
        this.total    = res.meta?.total ?? 0;
        this.pages    = res.meta?.pages ?? 1;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.load();
  }

  resetFilters(): void {
    this.filterStatus        = '';
    this.filterPaymentStatus = '';
    this.filterUserId        = '';
    this.page = 1;
    this.load();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.pages) return;
    this.page = p;
    this.load();
  }

  openDetail(ad: AiAd): void {
    this.selected = ad;
  }

  closeDetail(): void {
    this.selected = null;
  }

  openGenerateModal(): void {
    this.genUserId    = '';
    this.genCaption   = '';
    this.genImagesRaw = '';
    this.genError     = '';
    this.genSuccess   = '';
    this.showGenerateModal = true;
  }

  closeGenerateModal(): void {
    if (this.genLoading) return;
    this.showGenerateModal = false;
  }

  submitGenerate(): void {
    this.genError   = '';
    this.genSuccess = '';

    const userId = parseInt(this.genUserId, 10);
    if (!this.genUserId || isNaN(userId)) {
      this.genError = 'User ID is required and must be a number.';
      return;
    }
    const caption = this.genCaption.trim();
    if (!caption) {
      this.genError = 'Caption is required.';
      return;
    }
    const sourceImages = this.genImagesRaw
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    if (sourceImages.length === 0) {
      this.genError = 'At least one source image URL is required.';
      return;
    }

    this.genLoading = true;
    this.aiAdService.adminGenerate({ user_id: userId, caption, source_images: sourceImages }).subscribe({
      next: () => {
        this.genLoading = false;
        this.genSuccess = 'AI ad queued successfully! Generation is running in the background.';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.showGenerateModal = false;
          this.load();
        }, 1800);
      },
      error: (err) => {
        this.genLoading = false;
        this.genError = err?.error?.message || 'Failed to create AI ad.';
        this.cdr.detectChanges();
      },
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      awaiting_payment: 'Awaiting Payment',
      pending:   'Pending',
      done:      'Done',
      failed:    'Failed',
    };
    return map[status] ?? status;
  }

  get pageNumbers(): number[] {
    const range: number[] = [];
    const start = Math.max(1, this.page - 2);
    const end   = Math.min(this.pages, this.page + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }
}
