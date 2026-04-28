import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SellerRequestService, SellerRequestFilters } from '../../../core/services/seller-request.service';
import { SellerRequest, SellerRequestStatus } from '../../../core/models/seller-request.model';

@Component({
  selector: 'app-seller-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller-requests.html',
  styleUrl: './seller-requests.scss',
})
export class SellerRequestsComponent implements OnInit {
  requests: SellerRequest[] = [];
  isLoading = false;

  // Pagination
  currentPage  = 1;
  limit        = 20;
  total        = 0;
  totalPages   = 0;
  pageNumbers: number[] = [];

  readonly pageSizes = [10, 20, 50, 100];

  // Filter
  statusFilter: SellerRequestStatus | '' = 'pending';

  constructor(
    private sellerRequestService: SellerRequestService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;

    const f: SellerRequestFilters = {
      page:  this.currentPage,
      limit: this.limit,
    };
    if (this.statusFilter) f.status = this.statusFilter;

    this.sellerRequestService.getAll(f).subscribe({
      next: (res) => {
        this.requests   = res.data;
        this.total      = res.pagination?.total ?? res.total ?? res.data.length;
        this.totalPages = this.total > 0 ? Math.ceil(this.total / this.limit) : 1;
        this.buildPageNumbers();
        this.isLoading  = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  buildPageNumbers(): void {
    const total = this.totalPages;
    const cur   = this.currentPage;
    const delta = 2;
    const pages: number[] = [];

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= cur - delta && i <= cur + delta)) {
        pages.push(i);
      }
    }

    const withGaps: number[] = [];
    for (let i = 0; i < pages.length; i++) {
      if (i > 0 && pages[i] - pages[i - 1] > 1) withGaps.push(-1);
      withGaps.push(pages[i]);
    }

    this.pageNumbers = withGaps;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.load();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.load();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.load();
  }

  get rangeStart(): number { return Math.min((this.currentPage - 1) * this.limit + 1, this.total); }
  get rangeEnd():   number { return Math.min(this.currentPage * this.limit, this.total); }

  goToDetail(id: number): void {
    this.router.navigate(['/dashboard/seller-requests', id]);
  }

  statusClass(status: SellerRequestStatus): string {
    const map: Record<SellerRequestStatus, string> = {
      pending:  'badge-pending',
      approved: 'badge-approved',
      rejected: 'badge-rejected',
    };
    return map[status] || '';
  }

  statusLabel(status: SellerRequestStatus): string {
    const map: Record<SellerRequestStatus, string> = {
      pending:  'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return map[status] || status;
  }
}
