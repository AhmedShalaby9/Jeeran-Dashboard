import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PropertyService, PropertyFilters } from '../../../core/services/property.service';
import { Property, PropertyType, PropertyStatus, ListingType, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, LISTING_TYPE_LABELS } from '../../../core/models/property.model';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';
import { FilterStateService } from '../../../core/services/filter-state.service';

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
  searchQ         = '';
  typeFilter      = '';
  statusFilter    = '';
  listingFilter   = '';
  agentFilter     = '';
  projectFilter: number | null = null;

  // Projects for dropdown
  projects: Project[] = [];

  readonly propertyTypes: { value: PropertyType; en: string; ar: string }[] =
    (Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map(key => ({
      value: key,
      ...PROPERTY_TYPE_LABELS[key],
    }));

  readonly propertyStatuses: { value: PropertyStatus; en: string; ar: string }[] =
    (Object.keys(PROPERTY_STATUS_LABELS) as PropertyStatus[]).map(key => ({
      value: key,
      ...PROPERTY_STATUS_LABELS[key],
    }));

  readonly listingTypes: { value: ListingType; en: string; ar: string }[] =
    (Object.keys(LISTING_TYPE_LABELS) as ListingType[]).map(key => ({
      value: key,
      ...LISTING_TYPE_LABELS[key],
    }));

  listingLabel(type: string, lang: 'en' | 'ar' = 'en'): string {
    return LISTING_TYPE_LABELS[type as ListingType]?.[lang] ?? type;
  }

  typeLabel(type: string, lang: 'en' | 'ar' = 'en'): string {
    return PROPERTY_TYPE_LABELS[type as PropertyType]?.[lang] ?? type;
  }

  statusLabel(status: string, lang: 'en' | 'ar' = 'en'): string {
    return PROPERTY_STATUS_LABELS[status as PropertyStatus]?.[lang] ?? status;
  }

  constructor(
    private propertyService:  PropertyService,
    private projectService:   ProjectService,
    private filterState:      FilterStateService,
    private router:           Router,
    private cdr:              ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.restoreFilters();
    this.loadProjects();
    this.load();
  }

  private saveFilters(): void {
    this.filterState.save('properties', {
      searchQ:       this.searchQ,
      typeFilter:    this.typeFilter,
      statusFilter:  this.statusFilter,
      listingFilter: this.listingFilter,
      agentFilter:   this.agentFilter,
      projectFilter: this.projectFilter,
      currentPage:   this.currentPage,
      limit:         this.limit,
    });
  }

  private restoreFilters(): void {
    const s = this.filterState.restore<any>('properties');
    if (!s) return;
    this.searchQ       = s.searchQ       ?? '';
    this.typeFilter    = s.typeFilter    ?? '';
    this.statusFilter  = s.statusFilter  ?? '';
    this.listingFilter = s.listingFilter ?? '';
    this.agentFilter   = s.agentFilter   ?? '';
    this.projectFilter = s.projectFilter ?? null;
    this.currentPage   = s.currentPage   ?? 1;
    this.limit         = s.limit         ?? 20;
  }

  loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (res) => { this.projects = res.data; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  load(): void {
    this.saveFilters();
    this.isLoading = true;

    const f: PropertyFilters = {
      page:  this.currentPage,
      limit: this.limit,
    };
    if (this.searchQ.trim())      f.q          = this.searchQ.trim();
    if (this.typeFilter)          f.type       = this.typeFilter;
    if (this.statusFilter)        f.status     = this.statusFilter;
    if (this.listingFilter)       f.listing_type = this.listingFilter;
    if (this.agentFilter.trim())  f.agent_name   = this.agentFilter.trim();
    if (this.projectFilter)       f.project_id   = this.projectFilter;

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
    this.searchQ       = '';
    this.typeFilter    = '';
    this.statusFilter  = '';
    this.listingFilter = '';
    this.agentFilter   = '';
    this.projectFilter = null;
    this.currentPage   = 1;
    this.filterState.clear('properties');
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
