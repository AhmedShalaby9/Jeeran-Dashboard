import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EMPTY, Subject, Subscription, catchError, debounceTime, switchMap, tap } from 'rxjs';
import { CallRequestService } from '../../../core/services/call-request.service';
import { CallRequest, CallRequestCounts, CallRequestStatus } from '../../../core/models/call-request.model';

/** "Request a call" from the app on primary units. The team calls the buyer back, then marks it contacted / closed. */
@Component({
  selector: 'app-call-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './call-requests.html',
  styleUrl: './call-requests.scss',
})
export class CallRequestsComponent implements OnInit, OnDestroy {
  requests: CallRequest[] = [];
  counts: CallRequestCounts = { new: 0, contacted: 0, closed: 0, all: 0 };
  isLoading = true;
  isRefreshing = false;
  failed = false;
  errorMsg = '';

  status: CallRequestStatus | '' = 'new';
  search = '';
  currentPage = 1;
  limit = 20;
  total = 0;
  totalPages = 1;
  readonly pageSizes = [10, 20, 50, 100];

  readonly tabs: { key: CallRequestStatus | ''; label: string }[] = [
    { key: 'new', label: 'New' },
    { key: 'contacted', label: 'Contacted' },
    { key: 'closed', label: 'Closed' },
    { key: '', label: 'All' },
  ];
  readonly statuses: CallRequestStatus[] = ['new', 'contacted', 'closed'];

  // per-row edits that are not saved yet
  draftStatus: Record<number, CallRequestStatus> = {};
  draftNote: Record<number, string> = {};
  saving = new Set<number>();

  private load$ = new Subject<void>();
  private typing$ = new Subject<void>();
  private subs = new Subscription();

  constructor(private service: CallRequestService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subs.add(
      this.load$.pipe(
        tap(() => {
          this.isRefreshing = this.requests.length > 0;
          this.failed = false;
        }),
        switchMap(() =>
          this.service.getPage({ status: this.status, q: this.search.trim(), page: this.currentPage, limit: this.limit }).pipe(
            catchError(() => {
              this.failed = true;
              this.isLoading = false;
              this.isRefreshing = false;
              this.cdr.detectChanges();
              return EMPTY;
            }),
          ),
        ),
      ).subscribe((res) => {
        this.requests = res.data;
        this.total = res.pagination?.total ?? res.data.length;
        this.totalPages = Math.max(1, Math.ceil(this.total / this.limit));
        this.draftStatus = {};
        this.draftNote = {};
        for (const r of res.data) {
          this.draftStatus[r.id] = r.status;
          this.draftNote[r.id] = r.admin_note ?? '';
        }
        this.isLoading = false;
        this.isRefreshing = false;
        this.cdr.detectChanges();
      }),
    );
    this.subs.add(this.typing$.pipe(debounceTime(300)).subscribe(() => this.reset()));
    this.loadCounts();
    this.load$.next();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private loadCounts(): void {
    this.service.getCounts().subscribe({
      next: (r) => {
        this.counts = r.data;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  countOf(key: CallRequestStatus | ''): number {
    return this.counts[key === '' ? 'all' : key] ?? 0;
  }

  reset(): void {
    this.currentPage = 1;
    this.load$.next();
  }

  onSearch(): void {
    this.typing$.next();
  }

  retry(): void {
    this.load$.next();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.currentPage) return;
    this.currentPage = p;
    this.load$.next();
  }

  get rangeStart(): number { return this.total === 0 ? 0 : (this.currentPage - 1) * this.limit + 1; }
  get rangeEnd(): number { return Math.min(this.currentPage * this.limit, this.total); }

  dirty(r: CallRequest): boolean {
    return this.draftStatus[r.id] !== r.status || (this.draftNote[r.id] ?? '') !== (r.admin_note ?? '');
  }

  save(r: CallRequest): void {
    if (this.saving.has(r.id) || !this.dirty(r)) return;
    this.saving.add(r.id);
    this.service.update(r.id, { status: this.draftStatus[r.id], admin_note: this.draftNote[r.id] ?? '' }).subscribe({
      next: (res) => {
        this.saving.delete(r.id);
        this.errorMsg = '';
        const wasOnTab = this.status === '' || this.status === res.data.status;
        if (wasOnTab) {
          Object.assign(r, res.data);
        } else {
          // it no longer belongs to this tab
          this.requests = this.requests.filter((x) => x.id !== r.id);
          this.total = Math.max(0, this.total - 1);
        }
        this.loadCounts();
        this.cdr.detectChanges();
      },
      error: () => {
        this.saving.delete(r.id);
        this.errorMsg = 'Could not save that request. Try again.';
        this.cdr.detectChanges();
      },
    });
  }

  statusLabel(s: CallRequestStatus): string {
    return { new: 'New', contacted: 'Contacted', closed: 'Closed' }[s] ?? s;
  }

  /** The number the buyer asked to be called on (kept with the request), else the one on their account. */
  phoneOf(r: CallRequest): string {
    return r.contact_phone || r.user?.phone || '';
  }

  telHref(phone?: string | null): string | null {
    const p = (phone ?? '').replace(/[^\d+]/g, '');
    return p ? `tel:${p}` : null;
  }
}
