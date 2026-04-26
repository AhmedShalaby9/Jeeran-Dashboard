import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PropertyService, PropertyFilters } from '../../../core/services/property.service';
import { Property } from '../../../core/models/property.model';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './properties.html',
  styleUrl: './properties.scss',
})
export class PropertiesComponent implements OnInit {
  properties: Property[] = [];
  isLoading = false;

  // Pagination state
  currentPage  = 1;
  limit        = 20;
  total        = 0;
  totalPages   = 0;
  pageNumbers: number[] = [];

  readonly pageSizes = [10, 20, 50, 100];

  // Filters
  searchQ      = '';
  typeFilter   = '';
  statusFilter = '';

  readonly propertyTypes    = ['فيلا', 'شقة', 'دوبلكس', 'بنتهاوس', 'تاون هاوس', 'محل', 'مكتب', 'عيادة'];
  readonly propertyStatuses = ['for_sale', 'for_rent', 'for_rent_furnished'];
  readonly statusLabels: Record<string, string> = {
    for_sale:           'For Sale',
    for_rent:           'For Rent',
    for_rent_furnished: 'For Rent (Furnished)',
  };

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;

    const f: PropertyFilters = {
      page:  this.currentPage,
      limit: this.limit,
    };
    if (this.searchQ.trim()) f.q      = this.searchQ.trim();
    if (this.typeFilter)      f.type   = this.typeFilter;
    if (this.statusFilter)    f.status = this.statusFilter;

    this.propertyService.getAll(f).subscribe({
      next: (res) => {
        this.properties = res.data;
        this.total      = res.pagination?.total ?? res.total ?? res.data.length;
        this.totalPages = this.total > 0 ? Math.ceil(this.total / Number(this.limit)) : 1;
        this.buildPageNumbers();

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Build a smart window of page numbers around the current page
  buildPageNumbers(): void {
    const total = this.totalPages;
    const cur   = this.currentPage;
    const delta = 2; // pages each side of current
    const pages: number[] = [];

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= cur - delta && i <= cur + delta)
      ) {
        pages.push(i);
      }
    }

    // Insert ellipsis markers as -1
    const withGaps: number[] = [];
    for (let i = 0; i < pages.length; i++) {
      if (i > 0 && pages[i] - pages[i - 1] > 1) {
        withGaps.push(-1); // gap marker
      }
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

  applyFilters(): void {
    this.currentPage = 1;
    this.load();
  }

  clearFilters(): void {
    this.searchQ     = '';
    this.typeFilter  = '';
    this.statusFilter = '';
    this.currentPage  = 1;
    this.load();
  }

  get rangeStart(): number { return Math.min((this.currentPage - 1) * this.limit + 1, this.total); }
  get rangeEnd():   number { return Math.min(this.currentPage * this.limit, this.total); }

  goToNew(): void { this.router.navigate(['/dashboard/properties/new']); }
  goToDetail(id: number): void { this.router.navigate(['/dashboard/properties', id]); }

  formatPrice(price: number): string {
    if (!price) return '—';
    return new Intl.NumberFormat('ar-EG').format(price) + ' ج.م';
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      for_sale:           'status-sale',
      for_rent:           'status-rent',
      for_rent_furnished: 'status-rent-furnished',
    };
    return map[status] || '';
  }
}
