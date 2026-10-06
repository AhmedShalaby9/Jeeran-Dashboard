import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FavoriteService } from '../../../core/services/favorite.service';
import { AdminFavoriteItem } from '../../../core/models/favorite.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss',
})
export class FavoritesComponent implements OnInit {
  favorites: AdminFavoriteItem[] = [];
  isLoading = false;

  // Filters
  filterSearch  = '';
  filterDateFrom = '';
  filterDateTo   = '';

  // Pagination
  currentPage = 1;
  limit       = 20;
  total       = 0;
  totalPages  = 0;
  pageNumbers: number[] = [];

  constructor(
    private favoriteService: FavoriteService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.favoriteService.getAllFavoritesAdmin({
      search:    this.filterSearch   || undefined,
      date_from: this.filterDateFrom || undefined,
      date_to:   this.filterDateTo   || undefined,
      page:      this.currentPage,
      limit:     this.limit,
    }).subscribe({
      next: (res) => {
        this.favorites  = res.data;
        this.total      = res.pagination?.total ?? res.data.length;
        this.totalPages = this.total > 0 ? Math.ceil(this.total / this.limit) : 1;
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

  applyFilters(): void {
    this.currentPage = 1;
    this.load();
  }

  resetFilters(): void {
    this.filterSearch   = '';
    this.filterDateFrom = '';
    this.filterDateTo   = '';
    this.currentPage    = 1;
    this.load();
  }

  // ── Pagination ────────────────────────────────────────────
  buildPageNumbers(): void {
    const total = this.totalPages;
    const cur   = this.currentPage;
    const pages: number[] = [];
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || Math.abs(i - cur) <= 2) pages.push(i);
    }
    const withGaps: number[] = [];
    for (let i = 0; i < pages.length; i++) {
      if (i > 0 && pages[i] - pages[i - 1] > 1) withGaps.push(-1);
      withGaps.push(pages[i]);
    }
    this.pageNumbers = withGaps;
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.currentPage) return;
    this.currentPage = p;
    this.load();
  }

  get rangeStart(): number { return Math.min((this.currentPage - 1) * this.limit + 1, this.total); }
  get rangeEnd():   number { return Math.min(this.currentPage * this.limit, this.total); }

  // ── Helpers ───────────────────────────────────────────────
  goToProperty(id: number | undefined): void {
    if (!id) return;
    this.router.navigate(['/dashboard/properties', id]);
  }

  formatPrice(price: string | undefined): string {
    if (!price) return '—';
    const n = parseFloat(price);
    if (isNaN(n)) return price;
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }
}
