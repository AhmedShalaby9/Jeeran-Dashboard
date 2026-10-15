import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EMPTY, Subject, Subscription, catchError, debounceTime, switchMap, tap } from 'rxjs';
import { CompoundService } from '../../../core/services/compound.service';
import { Compound, CompoundFilter, CompoundListMeta, CompoundSort } from '../../../core/models/compound.model';

@Component({
  selector: 'app-compounds',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compounds.html',
  styleUrl: './compounds.scss',
})
export class CompoundsComponent implements OnInit, OnDestroy {
  /** The page being shown: the server returns 20 at a time, never the whole list. */
  compounds: Compound[] = [];
  total = 0;
  isLoading = false;   // first load: placeholders
  isRefreshing = false; // a page / filter change: the cards dim until the new page arrives
  failed = false;

  search = '';
  filter: CompoundFilter = 'all';
  areaId: number | '' = '';
  developerId: number | '' = '';
  sort: CompoundSort = 'newest';
  page = 1;
  pageSize = 20;
  readonly pageSizes = [20, 40, 100];
  readonly placeholders = Array.from({ length: 8 });

  meta: CompoundListMeta | null = null;

  readonly filters: { id: CompoundFilter; label: string }[] = [
    { id: 'all', label: 'All' }, { id: 'active', label: 'Active' }, { id: 'inactive', label: 'Inactive' },
    { id: 'imported', label: 'Imported' }, { id: 'launch', label: 'New launch' }, { id: 'offer', label: 'Offer' },
    { id: 'with-units', label: 'With listings' }, { id: 'no-units', label: 'No listings' },
    { id: 'no-image', label: 'No image' }, { id: 'no-arabic', label: 'No Arabic text' }, { id: 'no-pin', label: 'No map pin' },
  ];
  readonly sorts: { id: CompoundSort; label: string }[] = [
    { id: 'newest', label: 'Newest first' }, { id: 'oldest', label: 'Oldest first' },
    { id: 'name-az', label: 'Name A → Z' }, { id: 'name-za', label: 'Name Z → A' },
    { id: 'units', label: 'Most listings' }, { id: 'followers', label: 'Most followers' },
    { id: 'price-low', label: 'Price: low to high' }, { id: 'price-high', label: 'Price: high to low' },
  ];

  get areas() { return this.meta?.areas ?? []; }
  get developers() { return this.meta?.developers ?? []; }
  count(f: CompoundFilter): number | string { return this.meta?.counts?.[f] ?? '…'; }

  get totalPages(): number { return Math.max(1, Math.ceil(this.total / this.pageSize)); }
  get hasFilters(): boolean {
    return !!this.search.trim() || this.filter !== 'all' || this.areaId !== '' || this.developerId !== '';
  }
  get from(): number { return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1; }
  get to(): number { return Math.min(this.page * this.pageSize, this.total); }

  private load$ = new Subject<void>();
  private typing$ = new Subject<void>();
  private subs = new Subscription();

  constructor(
    private compoundService: CompoundService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // a newer request cancels the one still running, so a slow answer can never overwrite a newer page;
    // a failed request is caught inside, so the stream stays alive for the next try
    this.subs.add(
      this.load$.pipe(
        tap(() => { this.isRefreshing = true; this.failed = false; this.cdr.detectChanges(); }),
        switchMap(() => this.compoundService.getPage({
          page: this.page, limit: this.pageSize, q: this.search, sort: this.sort,
          filter: this.filter, developerId: this.developerId, areaId: this.areaId,
        }).pipe(catchError(() => {
          this.failed = true; this.isLoading = false; this.isRefreshing = false; this.cdr.detectChanges();
          return EMPTY;
        }))),
      ).subscribe((res) => {
        this.compounds = res.data;
        this.total = res.total;
        this.isLoading = false;
        this.isRefreshing = false;
        this.cdr.detectChanges();
      }),
    );
    this.subs.add(this.typing$.pipe(debounceTime(300)).subscribe(() => this.reset()));
    this.isLoading = true;
    this.load$.next();
    this.compoundService.getListMeta().subscribe({
      next: (res) => { this.meta = res.data; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  /** Typing waits for a short pause before asking the server. */
  onSearchInput(): void { this.typing$.next(); }

  /** Any change to the search, a filter, the sort or the page size starts again from page 1. */
  reset(): void { this.page = 1; this.load$.next(); }

  go(p: number): void {
    const next = Math.min(Math.max(1, p), this.totalPages);
    if (next === this.page) return;
    this.page = next;
    this.load$.next();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  retry(): void { this.load$.next(); }

  clearFilters(): void {
    this.search = ''; this.filter = 'all'; this.areaId = ''; this.developerId = '';
    this.reset();
  }

  goToNew(): void {
    this.router.navigate(['/dashboard/compounds/new']);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/dashboard/compounds', id]);
  }
}
