import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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

  constructor(private aiAdService: AiAdService, private cdr: ChangeDetectorRef, private router: Router) {}

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
    this.router.navigate(['/dashboard/ai-ads', ad.id]);
  }

  goToNew(): void {
    this.router.navigate(['/dashboard/ai-ads/new']);
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
