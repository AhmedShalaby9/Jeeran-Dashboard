import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import {
  Notification,
  NotificationAudience,
  NotificationType,
  SendNotificationDto,
  NotificationTarget,
} from '../../../core/models/notification.model';

interface ComposeForm {
  title_en:  string;
  title_ar:  string;
  body_en:   string;
  body_ar:   string;
  type:      NotificationType;
  entity_id: number | null;
  audience:  NotificationAudience;
  // registered_between
  date_from: string;
  date_to:   string;
  // user_type
  user_type: string;
  // single_user
  user_id:   number | null;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.html',
  styleUrl:    './notifications.scss',
})
export class NotificationsComponent implements OnInit {

  notifications: Notification[] = [];
  isLoading  = false;
  showPanel  = false;
  isSending  = false;
  sendError  = '';
  sendSuccess = '';

  // Pagination
  currentPage = 1;
  limit       = 20;
  total       = 0;
  totalPages  = 0;
  pageNumbers: number[] = [];

  readonly types: { value: NotificationType; label: string }[] = [
    { value: 'general',      label: 'General'      },
    { value: 'subscription', label: 'Subscription' },
    { value: 'property',     label: 'Property'     },
  ];

  readonly audiences: { value: NotificationAudience; label: string }[] = [
    { value: 'all',                label: 'All Users'           },
    { value: 'registered_between', label: 'Registered Between'  },
    { value: 'user_type',          label: 'By User Type'        },
    { value: 'single_user',        label: 'Single User'         },
  ];

  readonly userTypes = ['buyer', 'seller', 'admin'];

  form: ComposeForm = this.blankForm();

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void { this.load(); }

  // ── Load list ─────────────────────────────────────────────
  load(): void {
    this.isLoading = true;
    this.notificationService.getAll(this.currentPage, this.limit).subscribe({
      next: (res) => {
        this.notifications = res.data;
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

  // ── Pagination ────────────────────────────────────────────
  buildPageNumbers(): void {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      if (i === 1 || i === this.totalPages || Math.abs(i - this.currentPage) <= 2) pages.push(i);
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

  // ── Compose panel ─────────────────────────────────────────
  openPanel(): void {
    this.form       = this.blankForm();
    this.sendError  = '';
    this.sendSuccess = '';
    this.showPanel  = true;
  }

  closePanel(): void {
    if (this.isSending) return;
    this.showPanel = false;
  }

  blankForm(): ComposeForm {
    return {
      title_en:  '',
      title_ar:  '',
      body_en:   '',
      body_ar:   '',
      type:      'general',
      entity_id: null,
      audience:  'all',
      date_from: '',
      date_to:   '',
      user_type: 'seller',
      user_id:   null,
    };
  }

  // ── Send ──────────────────────────────────────────────────
  send(): void {
    if (!this.form.title_en.trim() && !this.form.title_ar.trim()) {
      this.sendError = 'At least one title (English or Arabic) is required.';
      return;
    }
    if (!this.form.body_en.trim() && !this.form.body_ar.trim()) {
      this.sendError = 'At least one body (English or Arabic) is required.';
      return;
    }
    if (this.form.audience === 'registered_between' && (!this.form.date_from || !this.form.date_to)) {
      this.sendError = 'Both date_from and date_to are required for "Registered Between".';
      return;
    }
    if (this.form.audience === 'single_user' && !this.form.user_id) {
      this.sendError = 'User ID is required for "Single User".';
      return;
    }

    const target: NotificationTarget = { audience: this.form.audience };
    if (this.form.audience === 'registered_between') {
      target.date_from = this.form.date_from;
      target.date_to   = this.form.date_to;
    }
    if (this.form.audience === 'user_type') {
      target.user_type = this.form.user_type;
    }
    if (this.form.audience === 'single_user') {
      target.user_id = this.form.user_id!;
    }

    const dto: SendNotificationDto = {
      title_en:  this.form.title_en.trim(),
      title_ar:  this.form.title_ar.trim(),
      body_en:   this.form.body_en.trim(),
      body_ar:   this.form.body_ar.trim(),
      type:      this.form.type,
      entity_id: this.form.entity_id,
      target,
    };

    this.isSending  = true;
    this.sendError  = '';
    this.notificationService.send(dto).subscribe({
      next: () => {
        this.isSending   = false;
        this.showPanel   = false;
        this.sendSuccess = 'Notification sent successfully!';
        this.cdr.detectChanges();
        this.load();
        setTimeout(() => { this.sendSuccess = ''; this.cdr.detectChanges(); }, 3500);
      },
      error: (err) => {
        this.isSending = false;
        this.sendError = err.error?.message || 'Failed to send notification.';
        this.cdr.detectChanges();
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────
  audienceLabel(n: Notification): string {
    const a = n.target?.audience;
    switch (a) {
      case 'all':                return 'All Users';
      case 'registered_between': return `Registered ${n.target.date_from} → ${n.target.date_to}`;
      case 'user_type':          return `User Type: ${n.target.user_type}`;
      case 'single_user':        return `User #${n.target.user_id}`;
      default:                   return a || '—';
    }
  }

  audienceBadgeClass(audience: NotificationAudience): string {
    const map: Record<NotificationAudience, string> = {
      all:                'badge-all',
      registered_between: 'badge-date',
      user_type:          'badge-type',
      single_user:        'badge-single',
    };
    return map[audience] || '';
  }

  typeClass(type: NotificationType): string {
    const map: Record<NotificationType, string> = {
      general:      'type-general',
      subscription: 'type-subscription',
      property:     'type-property',
    };
    return map[type] || '';
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
