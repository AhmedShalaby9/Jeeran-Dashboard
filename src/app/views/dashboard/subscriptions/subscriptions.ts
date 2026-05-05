import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { Subscription, SubscriptionFilters, SubscriptionStatus } from '../../../core/models/subscription.model';
import { PackageService } from '../../../core/services/package.service';
import { Package } from '../../../core/models/package.model';

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

  filterStatus: SubscriptionStatus | '' = '';
  filterUserName = '';
  filterPackageId: number | '' = '';

  page = 1;
  limit = 20;
  totalPages = 1;
  total = 0;

  constructor(
    private subscriptionService: SubscriptionService,
    private packageService: PackageService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.packageService.getAll().subscribe({ next: (res) => { this.packages = res.data; } });
    this.load();
  }

  load(): void {
    this.isLoading = true;
    const filters: SubscriptionFilters = { page: this.page, limit: this.limit };
    if (this.filterStatus)    filters.status     = this.filterStatus;
    if (this.filterUserName)  filters.user_name  = this.filterUserName;
    if (this.filterPackageId) filters.package_id = Number(this.filterPackageId);

    this.subscriptionService.getAdminAll(filters).subscribe({
      next: (res) => {
        this.subscriptions = res.data;
        this.total         = res.pagination?.total ?? res.data.length;
        this.totalPages    = res.pagination?.total_pages ?? 1;
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
    this.filterStatus    = '';
    this.filterUserName  = '';
    this.filterPackageId = '';
    this.page = 1;
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

  statusBadgeClass(status: SubscriptionStatus): string {
    const map: Record<SubscriptionStatus, string> = {
      active:    'badge-active',
      expired:   'badge-expired',
      cancelled: 'badge-cancelled',
    };
    return map[status] ?? '';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
