import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LangService, Lang } from '../../core/services/lang.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserNotification } from '../../core/models/notification.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  pendingApprovalCount = 0;

  // ── Bell / Inbox ─────────────────────────────────────────
  unreadCount  = 0;
  showInbox    = false;
  inboxItems: UserNotification[] = [];
  inboxLoading = false;
  inboxPage    = 1;
  inboxHasMore = false;

  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private authService: AuthService,
    public langService: LangService,
    private subscriptionService: SubscriptionService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadPendingCount();
    this.loadUnreadCount();
    this.pollTimer = setInterval(() => this.loadUnreadCount(), 60_000);
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  // ── Pending subscriptions ─────────────────────────────────
  private loadPendingCount(): void {
    this.subscriptionService.getAdminAll({ status: 'pending_approval', limit: 1 }).subscribe({
      next: (res) => {
        this.pendingApprovalCount = res.meta?.total ?? res.pagination?.total ?? 0;
      },
      error: () => {},
    });
  }

  // ── Unread count ──────────────────────────────────────────
  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (res) => {
        this.unreadCount = res.data?.unread_count ?? 0;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  // ── Inbox drawer ──────────────────────────────────────────
  toggleInbox(): void {
    this.showInbox = !this.showInbox;
    if (this.showInbox && this.inboxItems.length === 0) {
      this.inboxPage = 1;
      this.loadInbox(true);
    }
  }

  closeInbox(): void {
    this.showInbox = false;
  }

  loadInbox(reset = true): void {
    if (this.inboxLoading) return;
    if (reset) { this.inboxPage = 1; this.inboxItems = []; }
    this.inboxLoading = true;
    this.notificationService.getMine(this.inboxPage, 20).subscribe({
      next: (res) => {
        const incoming = res.data.notifications;
        this.inboxItems  = reset ? incoming : [...this.inboxItems, ...incoming];
        const pagination = res.data.pagination;
        this.inboxHasMore = pagination ? this.inboxPage < pagination.pages : false;
        this.inboxLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.inboxLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadMoreInbox(): void {
    this.inboxPage++;
    this.loadInbox(false);
  }

  markRead(item: UserNotification): void {
    if (item.is_read) return;
    this.notificationService.markRead(item.id).subscribe({
      next: () => {
        item.is_read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  markAllRead(): void {
    this.notificationService.markAllRead().subscribe({
      next: () => {
        this.inboxItems.forEach(n => (n.is_read = true));
        this.unreadCount = 0;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  // ── Helpers ───────────────────────────────────────────────
  formatDate(iso: string): string {
    if (!iso) return '—';
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1)    return 'just now';
    if (mins < 60)   return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // ── Auth / Lang ───────────────────────────────────────────
  logout(): void { this.authService.logout(); }

  get lang(): Lang { return this.langService.lang; }
  toggleLang(): void { this.langService.toggle(); }
}
