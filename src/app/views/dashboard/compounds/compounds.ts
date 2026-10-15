import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompoundService } from '../../../core/services/compound.service';
import { Compound } from '../../../core/models/compound.model';

type CompoundFilter = 'all' | 'active' | 'inactive' | 'imported' | 'launch' | 'offer' | 'with-units' | 'no-units' | 'no-image' | 'no-arabic' | 'no-pin';
type CompoundSort = 'newest' | 'oldest' | 'name-az' | 'name-za' | 'units' | 'followers' | 'price-low' | 'price-high';

@Component({
  selector: 'app-compounds',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compounds.html',
  styleUrl: './compounds.scss',
})
export class CompoundsComponent implements OnInit {
  compounds: Compound[] = [];
  isLoading = false;

  // 860+ compounds: search, filters, sorting and pages all run on the loaded list
  search = '';
  filter: CompoundFilter = 'all';
  areaId: number | '' = '';
  developerId: number | '' = '';
  sort: CompoundSort = 'newest';
  page = 1;
  pageSize = 24;
  readonly pageSizes = [12, 24, 48, 96];
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

  /** Areas that actually have a compound, for the area dropdown. */
  get areas(): { id: number; name: string }[] {
    const seen = new Map<number, string>();
    for (const c of this.compounds) if (c.area_id && c.area) seen.set(c.area_id, c.area.name_en || c.area.name_ar);
    return [...seen].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }

  /** Developers that actually have a compound, for the developer dropdown. */
  get developers(): { id: number; name: string }[] {
    const seen = new Map<number, string>();
    for (const c of this.compounds) if (c.developer_id && c.developer) seen.set(c.developer_id, c.developer.name_en || c.developer.name_ar);
    return [...seen].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }

  private matches(c: Compound, f: CompoundFilter): boolean {
    switch (f) {
      case 'active': return !!c.is_active;
      case 'inactive': return !c.is_active;
      case 'imported': return !!c.nawy_id;
      case 'launch': return c.promotion?.type === 'launch';
      case 'offer': return c.promotion?.type === 'offer';
      case 'with-units': return (c.units_count ?? 0) > 0;
      case 'no-units': return (c.units_count ?? 0) === 0;
      case 'no-image': return !c.main_image && !c.gallery?.length;
      case 'no-arabic': return !c.desc_ar;
      case 'no-pin': return !c.latitude;
      default: return true;
    }
  }

  private compare(a: Compound, b: Compound): number {
    const name = (c: Compound) => (c.name_en || c.name_ar || '').toLowerCase();
    const time = (c: Compound) => new Date(c.created_at as unknown as string).getTime() || 0;
    // compounds without a price go last in both directions
    const price = (c: Compound, missing: number) => (c.min_price == null ? missing : Number(c.min_price));
    switch (this.sort) {
      case 'oldest': return time(a) - time(b) || a.id - b.id;
      case 'name-az': return name(a).localeCompare(name(b));
      case 'name-za': return name(b).localeCompare(name(a));
      case 'units': return (b.units_count ?? 0) - (a.units_count ?? 0) || name(a).localeCompare(name(b));
      case 'followers': return (b.followers_count ?? 0) - (a.followers_count ?? 0) || name(a).localeCompare(name(b));
      case 'price-low': return price(a, Infinity) - price(b, Infinity) || name(a).localeCompare(name(b));
      case 'price-high': return price(b, -Infinity) - price(a, -Infinity) || name(a).localeCompare(name(b));
      default: return time(b) - time(a) || b.id - a.id;
    }
  }

  /** Everything the filters keep, in the chosen order (the chip counts ignore the chip itself). */
  get filtered(): Compound[] {
    // the template reads this many times per change-detection pass: sort once per distinct set of inputs
    const key = [this.search, this.filter, this.areaId, this.developerId, this.sort].join('|');
    if (this.memo && this.memo.list === this.compounds && this.memo.key === key) return this.memo.result;
    const q = this.search.trim().toLowerCase();
    const result = this.compounds
      .filter((c) => {
        if (this.areaId !== '' && c.area_id !== this.areaId) return false;
        if (this.developerId !== '' && c.developer_id !== this.developerId) return false;
        if (!this.matches(c, this.filter)) return false;
        if (!q) return true;
        return [c.name_en, c.name_ar, c.developer?.name_en, c.developer?.name_ar, c.area?.name_en, c.area?.name_ar, c.nawy_id, ...(c.aliases || [])]
          .some((v) => v != null && String(v).toLowerCase().includes(q));
      })
      .sort((a, b) => this.compare(a, b));
    this.memo = { list: this.compounds, key, result };
    return result;
  }
  private memo?: { list: Compound[]; key: string; result: Compound[] };

  count(f: CompoundFilter): number { return this.compounds.filter((c) => this.matches(c, f)).length; }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get pageItems(): Compound[] {
    const start = (Math.min(this.page, this.totalPages) - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }
  get hasFilters(): boolean {
    return !!this.search.trim() || this.filter !== 'all' || this.areaId !== '' || this.developerId !== '';
  }
  /** Any change to the search, a filter, the sort or the page size starts again from page 1. */
  reset(): void { this.page = 1; }
  go(p: number): void {
    this.page = Math.min(Math.max(1, p), this.totalPages);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  clearFilters(): void {
    this.search = ''; this.filter = 'all'; this.areaId = ''; this.developerId = ''; this.page = 1;
  }

  constructor(
    private compoundService: CompoundService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCompounds();
  }

  loadCompounds(): void {
    this.isLoading = true;
    this.compoundService.getAll().subscribe({
      next: (res) => {
        this.compounds  = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToNew(): void {
    this.router.navigate(['/dashboard/compounds/new']);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/dashboard/compounds', id]);
  }
}
