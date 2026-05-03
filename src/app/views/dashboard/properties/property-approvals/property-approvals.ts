import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PropertyService, PropertyFilters } from '../../../../core/services/property.service';
import { ProjectService } from '../../../../core/services/project.service';
import { Property } from '../../../../core/models/property.model';
import { Project } from '../../../../core/models/project.model';

type ApprovalTab = 'all' | 'pending' | 'approved' | 'rejected';

interface ConfirmModal {
  show:     boolean;
  action:   'approve' | 'reject';
  property: Property | null;
}

@Component({
  selector: 'app-property-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-approvals.html',
  styleUrl:    './property-approvals.scss',
})
export class PropertyApprovalsComponent implements OnInit {

  properties: Property[] = [];
  projects:   Project[]  = [];
  isLoading   = false;

  // Pagination
  currentPage = 1;
  limit       = 20;
  total       = 0;
  totalPages  = 0;
  pageNumbers: number[] = [];

  // Filters
  activeTab: ApprovalTab = 'pending';

  // Tab counts
  counts: Record<ApprovalTab, number> = { all: 0, pending: 0, approved: 0, rejected: 0 };
  countsLoaded = false;

  // Action state
  modal: ConfirmModal = { show: false, action: 'approve', property: null };
  isActioning   = false;
  toast: { type: 'success' | 'error'; message: string } | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  readonly typeLabels: Record<string, string> = {
    villa: 'فيلا', apartment: 'شقة', chalet: 'شاليه',
    marina_apartment: 'شقة مارينا', studio: 'استوديو', duplex: 'دوبلكس',
    land: 'أرض', clinic: 'عيادة', office: 'مكتب', shop: 'محل',
  };
  readonly statusLabels: Record<string, string> = {
    for_sale: 'For Sale', for_rent: 'For Rent', for_rent_furnished: 'For Rent (Furnished)',
  };
  readonly stateLabels: Record<string, string> = {
    cairo: 'القاهرة', north_coast: 'الساحل الشمالي', sharm_el_sheikh: 'شرم الشيخ',
  };

  constructor(
    private propertyService: PropertyService,
    private projectService:  ProjectService,
    private router:          Router,
    private cdr:             ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadCounts();
    this.load();
  }

  loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (res) => { this.projects = res.data; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  // ── Load tab counts ───────────────────────────────────────
  loadCounts(): void {
    const tabs: { tab: ApprovalTab; filter: PropertyFilters }[] = [
      { tab: 'all',      filter: { page: 1, limit: 1 } },
      { tab: 'pending',  filter: { page: 1, limit: 1, is_approved: 'false' } },
      { tab: 'approved', filter: { page: 1, limit: 1, is_approved: 'true' } },
      { tab: 'rejected', filter: { page: 1, limit: 1, is_approved: 'false' } },
    ];
    tabs.forEach(({ tab, filter }) => {
      this.propertyService.getAll(filter).subscribe({
        next: (res) => {
          this.counts[tab] = res.pagination?.total ?? res.total ?? 0;
          this.countsLoaded = true;
          this.cdr.detectChanges();
        },
        error: () => {},
      });
    });
  }

  // ── Main load ─────────────────────────────────────────────
  load(): void {
    this.isLoading = true;
    const f: PropertyFilters = { page: this.currentPage, limit: this.limit };

    if (this.activeTab === 'pending')  f.is_approved = 'false';
    if (this.activeTab === 'approved') f.is_approved = 'true';
    if (this.activeTab === 'rejected') f.is_approved = 'false';

    this.propertyService.getAll(f).subscribe({
      next: (res) => {
        this.properties = res.data;
        this.total      = res.pagination?.total ?? res.total ?? res.data.length;
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

  // ── Tabs ──────────────────────────────────────────────────
  setTab(tab: ApprovalTab): void {
    if (this.activeTab === tab) return;
    this.activeTab  = tab;
    this.currentPage = 1;
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

  // ── Action modal ──────────────────────────────────────────
  openApprove(prop: Property): void {
    this.modal = { show: true, action: 'approve', property: prop };
  }

  openReject(prop: Property): void {
    this.modal = { show: true, action: 'reject', property: prop };
  }

  closeModal(): void {
    if (this.isActioning) return;
    this.modal = { show: false, action: 'approve', property: null };
  }

  executeAction(): void {
    if (!this.modal.property) return;
    this.isActioning = true;
    const id  = this.modal.property.id;
    const obs = this.modal.action === 'approve'
      ? this.propertyService.approve(id)
      : this.propertyService.reject(id);

    obs.subscribe({
      next: () => {
        this.isActioning = false;
        const label = this.modal.action === 'approve' ? 'approved' : 'rejected';
        this.closeModal();
        this.showToast('success', `Property ${label} successfully.`);
        this.loadCounts();
        this.load();
      },
      error: (err) => {
        this.isActioning = false;
        this.closeModal();
        this.showToast('error', err.error?.message || 'Action failed. Please try again.');
        this.cdr.detectChanges();
      },
    });
  }

  // ── Toast ─────────────────────────────────────────────────
  showToast(type: 'success' | 'error', message: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast = { type, message };
    this.cdr.detectChanges();
    this.toastTimer = setTimeout(() => {
      this.toast = null;
      this.cdr.detectChanges();
    }, 3500);
  }

  // ── Helpers ───────────────────────────────────────────────
  approvalStatus(prop: Property): 'pending' | 'approved' | 'rejected' {
    if (prop.is_approved === true)  return 'approved';
    if (prop.is_approved === false) return 'rejected';
    return 'pending';
  }

  propTitle(prop: Property): string {
    return prop.title_ar || prop.title_en || prop.title || '—';
  }

  projectName(id: number | null): string {
    if (!id) return '—';
    const p = this.projects.find(p => p.id === id);
    return p ? (p.name_en || p.name_ar) : `#${id}`;
  }

  formatPrice(price: number): string {
    if (!price) return '—';
    return new Intl.NumberFormat('ar-EG').format(price) + ' ج.م';
  }

  goToDetail(id: number): void {
    this.router.navigate(['/dashboard/properties', id]);
  }
}
