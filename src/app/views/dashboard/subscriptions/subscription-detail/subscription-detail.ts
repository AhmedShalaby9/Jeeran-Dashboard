import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { Subscription, SubscriptionStatus } from '../../../../core/models/subscription.model';

@Component({
  selector: 'app-subscription-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-detail.html',
  styleUrl: './subscription-detail.scss',
})
export class SubscriptionDetailComponent implements OnInit {
  subscription: Subscription | null = null;
  isLoading       = false;
  isApproving     = false;
  isRejecting     = false;
  isCancelling    = false;
  showCancelModal = false;
  errorMessage    = '';
  successMessage  = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.load(id);
  }

  load(id: number): void {
    this.isLoading = true;
    this.subscriptionService.getAdminById(id).subscribe({
      next: (res) => {
        this.subscription = res.data;
        this.isLoading    = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard/subscriptions']);
      },
    });
  }

  approve(): void {
    if (!this.subscription) return;
    this.isApproving = true;
    this.errorMessage = '';
    this.subscriptionService.approve(this.subscription.id).subscribe({
      next: (res) => {
        this.isApproving   = false;
        this.subscription  = res.data;
        this.successMessage = 'Subscription approved successfully.';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.isApproving  = false;
        this.errorMessage = err.error?.message || 'Failed to approve subscription.';
        this.cdr.detectChanges();
      },
    });
  }

  reject(): void {
    if (!this.subscription) return;
    this.isRejecting = true;
    this.errorMessage = '';
    this.subscriptionService.reject(this.subscription.id).subscribe({
      next: () => {
        this.isRejecting    = false;
        this.successMessage = 'Subscription rejected.';
        this.load(this.subscription!.id);
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.isRejecting  = false;
        this.errorMessage = err.error?.message || 'Failed to reject subscription.';
        this.cdr.detectChanges();
      },
    });
  }

  confirmCancel(): void { this.showCancelModal = true; }
  dismissCancel(): void { this.showCancelModal = false; }

  doCancel(): void {
    this.isCancelling = true;
    this.subscriptionService.cancelAdmin(this.subscription!.id).subscribe({
      next: () => {
        this.isCancelling    = false;
        this.showCancelModal = false;
        this.successMessage  = 'Subscription cancelled successfully.';
        this.load(this.subscription!.id);
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.isCancelling    = false;
        this.showCancelModal = false;
        this.errorMessage    = err.error?.message || 'Failed to cancel subscription.';
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

  formatDateTime(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/subscriptions']);
  }
}
