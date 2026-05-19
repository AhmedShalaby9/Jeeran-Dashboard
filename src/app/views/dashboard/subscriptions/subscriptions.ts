import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { Subscription, SubscriptionFilters, SubscriptionStatus } from '../../../core/models/subscription.model';
import { PackageService } from '../../../core/services/package.service';
import { Package } from '../../../core/models/package.model';
import { FilterStateService } from '../../../core/services/filter-state.service';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.scss',
})
export class SubscriptionsComponent implements OnInit {
  subscriptions: Subscription[] = [];
  packages: Package[] = [];
  isLoading = false;
  errorMessage = '';

  filterStatus: SubscriptionStatus | '' = 'pending_approval';
  filterUserName = '';
  filterPackageId: number | '' = '';

  page = 1;
  limit = 20;
  totalPages = 1;
  total = 0;

  actingId: number | null = null;

  constructor(
    private subscriptionService: SubscriptionService,
    private packageService:      PackageService,
    private filterState:         FilterStateService,
    private router:              Router,
    private cdr:                 ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.restoreFilters();
    this.packageService.getAll().subscribe({ next: (res) => { this.packages = res.data; } });
    this.load();
  }

  private saveFilters(): void {
    this.filterState.save('subscriptions', {
      filterStatus:    this.filterStatus,
      filterUserName:  this.filterUserName,
      filterPackageId: this.filterPackageId,
      page:            this.page,
      limit:           this.limit,
    });
  }

  private restoreFilters(): void {
    const s = this.filterState.restore<any>('subscriptions');
    if (!s) return;
    this.filterStatus    = s.filterStatus    ?? 'pending_approval';
    this.filterUserName  = s.filterUserName  ?? '';
    this.filterPackageId = s.filterPackageId ?? '';
    this.page            = s.page            ?? 1;
    this.limit           = s.limit           ?? 20;
  }

  load(): void {
    this.saveFilters();
    this.isLoading = true;
    const filters: SubscriptionFilters = { page: this.page, limit: this.limit };
    if (this.filterStatus)    filters.status     = this.filterStatus;
    if (this.filterUserName)  filters.user_name  = this.filterUserName;
    if (this.filterPackageId) filters.package_id = Number(this.filterPackageId);

    this.subscriptionService.getAdminAll(filters).subscribe({
      next: (res) => {
        this.subscriptions = res.data;
        this.total         = res.meta?.total ?? res.pagination?.total ?? res.data.length;
        this.totalPages    = res.pagination?.total_pages ?? (this.total > 0 ? Math.ceil(this.total / this.limit) : 1);
        this.isLoading     = false;
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
    this.filterStatus    = 'pending_approval';
    this.filterUserName  = '';
    this.filterPackageId = '';
    this.page            = 1;
    this.filterState.clear('subscriptions');
    this.load();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.load();
  }

  goToDetail(id: number): void {
    this.router.navigate(['/dashboard/subscriptions', id]);
  }

  approveRow(id: number): void {
    this.actingId = id;
    this.errorMessage = '';
    this.subscriptionService.approve(id).subscribe({
      next: () => {
        this.actingId = null;
        this.load();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.actingId = null;
        this.errorMessage = err.error?.message || 'Failed to approve subscription.';
        this.cdr.detectChanges();
      },
    });
  }

  rejectRow(id: number): void {
    this.actingId = id;
    this.errorMessage = '';
    this.subscriptionService.reject(id).subscribe({
      next: () => {
        this.actingId = null;
        this.load();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.actingId = null;
        this.errorMessage = err.error?.message || 'Failed to reject subscription.';
        this.cdr.detectChanges();
      },
    });
  }

  statusBadgeClass(status: SubscriptionStatus | string): string {
    const map: Record<string, string> = {
      pending_payment:  'badge-warning',
      pending_approval: 'badge-info',
      active:           'badge-active',
      rejected:         'badge-rejected',
      cancelled:        'badge-cancelled',
      upgraded:         'badge-upgraded',
      expired:          'badge-expired',
    };
    return map[status] ?? '';
  }

  formatDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
