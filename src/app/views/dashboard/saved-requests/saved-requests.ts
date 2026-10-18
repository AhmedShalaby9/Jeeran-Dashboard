import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EMPTY, Subject, Subscription, catchError, debounceTime, switchMap, tap } from 'rxjs';
import { SavedRequestService } from '../../../core/services/saved-request.service';
import { SavedRequest, SavedRequestCounts, SavedRequestInsights, SavedRequestState } from '../../../core/models/saved-request.model';

/** Searches the AI could not answer: the person asked to be told when something fits. */
@Component({
  selector: 'app-saved-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './saved-requests.html',
  styleUrl: './saved-requests.scss',
})
export class SavedRequestsComponent implements OnInit, OnDestroy {
  requests: SavedRequest[] = [];
  counts: SavedRequestCounts = { active: 0, cancelled: 0, expired: 0, all: 0, unhandled: 0, new_7d: 0, matched: 0 };
  insights: SavedRequestInsights | null = null;
  isLoading = true;
  isRefreshing = false;
  failed = false;
  errorMsg = '';

  state: SavedRequestState | '' = 'active';
  matched: 'true' | 'false' | '' = '';
  handled: 'true' | 'false' | '' = '';
  propertyType = '';
  propertyStatus = '';
  from = '';
  to = '';
  search = '';
  currentPage = 1;
  limit = 20;
  total = 0;
  totalPages = 1;
  readonly pageSizes = [10, 20, 50, 100];

  readonly tabs: { key: SavedRequestState | ''; label: string }[] = [
    { key: 'active', label: 'Active' },
    { key: 'expired', label: 'Expired' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: '', label: 'All' },
  ];
  readonly types = ['apartment', 'villa', 'townhouse', 'twinhouse', 'duplex', 'penthouse', 'studio', 'chalet', 'marina_apartment', 'cabin', 'loft', 'family_house', 'clinic', 'office', 'shop', 'land'];

  openId: number | null = null;
  detail: SavedRequest | null = null;
  detailLoading = false;
  draftNote: Record<number, string> = {};
  saving = new Set<number>();

  private load$ = new Subject<void>();
  private typing$ = new Subject<void>();
  private subs = new Subscription();

  constructor(private service: SavedRequestService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subs.add(
      this.load$.pipe(
        tap(() => {
          this.isRefreshing = this.requests.length > 0;
          this.failed = false;
        }),
        switchMap(() =>
          this.service.getPage({
            state: this.state, matched: this.matched, handled: this.handled,
            property_type: this.propertyType, property_status: this.propertyStatus,
            from: this.from, to: this.to, q: this.search.trim(), page: this.currentPage, limit: this.limit,
          }).pipe(
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
        this.draftNote = {};
        for (const r of res.data) this.draftNote[r.id] = r.admin_note ?? '';
        this.isLoading = false;
        this.isRefreshing = false;
        this.cdr.detectChanges();
      }),
    );
    this.subs.add(this.typing$.pipe(debounceTime(300)).subscribe(() => this.reset()));
    this.loadCounts();
    this.service.getInsights().subscribe({ next: (r) => { this.insights = r.data; this.cdr.detectChanges(); }, error: () => {} });
    this.load$.next();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private loadCounts(): void {
    this.service.getCounts().subscribe({
      next: (r) => { this.counts = r.data; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  countOf(key: SavedRequestState | ''): number {
    return key === '' ? this.counts.all : this.counts[key] ?? 0;
  }

  reset(): void { this.currentPage = 1; this.load$.next(); }
  onSearch(): void { this.typing$.next(); }
  retry(): void { this.load$.next(); }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.currentPage) return;
    this.currentPage = p;
    this.load$.next();
  }

  get rangeStart(): number { return this.total === 0 ? 0 : (this.currentPage - 1) * this.limit + 1; }
  get rangeEnd(): number { return Math.min(this.currentPage * this.limit, this.total); }

  toggle(r: SavedRequest): void {
    if (this.openId === r.id) { this.openId = null; this.detail = null; return; }
    this.openId = r.id;
    this.detail = null;
    this.detailLoading = true;
    this.service.getById(r.id).subscribe({
      next: (res) => { if (this.openId === r.id) { this.detail = res.data; } this.detailLoading = false; this.cdr.detectChanges(); },
      error: () => { this.detailLoading = false; this.errorMsg = 'Could not load that request.'; this.cdr.detectChanges(); },
    });
  }

  private apply(r: SavedRequest, patch: { handled?: boolean; admin_note?: string; status?: 'cancelled' }): void {
    if (this.saving.has(r.id)) return;
    this.saving.add(r.id);
    this.service.update(r.id, patch).subscribe({
      next: (res) => {
        this.saving.delete(r.id);
        this.errorMsg = '';
        Object.assign(r, res.data);
        this.draftNote[r.id] = r.admin_note ?? '';
        if (patch.status === 'cancelled' && this.state === 'active') {
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

  toggleHandled(r: SavedRequest): void { this.apply(r, { handled: !r.handled_at }); }
  saveNote(r: SavedRequest): void { if ((this.draftNote[r.id] ?? '') !== (r.admin_note ?? '')) this.apply(r, { admin_note: this.draftNote[r.id] ?? '' }); }
  cancel(r: SavedRequest): void { this.apply(r, { status: 'cancelled' }); }

  noteDirty(r: SavedRequest): boolean { return (this.draftNote[r.id] ?? '') !== (r.admin_note ?? ''); }

  label(s: string | null | undefined): string {
    return s ? s.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()) : '';
  }

  money(n: number | string | null | undefined): string {
    const v = Number(n);
    if (!(v > 0)) return '';
    return v >= 1e6 ? `${(v / 1e6).toFixed(2).replace(/\.?0+$/, '')}M` : `${Math.round(v / 1000)}K`;
  }

  /** The request as a few readable chips. */
  chips(r: SavedRequest): string[] {
    const f = r.filters ?? {};
    const out: string[] = [];
    if (f.property_type) out.push(this.label(f.property_type));
    if (f.property_status) out.push(f.property_status === 'for_rent' ? 'For rent' : 'For sale');
    if (f.listing_type) out.push(this.label(f.listing_type));
    if (r.compound) out.push(r.compound.name_en || r.compound.name_ar || `Compound #${f.compound_id}`);
    else if (f.compound_id) out.push(`Compound #${f.compound_id}`);
    if (r.developer) out.push(r.developer.name_en || r.developer.name_ar || `Developer #${f.developer_id}`);
    if (f.state) out.push(this.label(f.state));
    if (f.bedrooms) out.push(`${f.bedrooms} bed`);
    if (f.bathrooms) out.push(`${f.bathrooms} bath`);
    if (f.min_price || f.max_price) {
      out.push(f.min_price && f.max_price ? `EGP ${this.money(f.min_price)}–${this.money(f.max_price)}`
        : f.max_price ? `Up to EGP ${this.money(f.max_price)}` : `From EGP ${this.money(f.min_price)}`);
    }
    if (f.min_size || f.max_size) out.push(`${f.min_size ?? ''}–${f.max_size ?? ''} m²`.replace(/^–|–$/, ''));
    if (f.q) out.push(`“${f.q}”`);
    return out;
  }

  telHref(phone?: string | null): string | null {
    const p = (phone ?? '').replace(/[^\d+]/g, '');
    return p ? `tel:${p}` : null;
  }
}
