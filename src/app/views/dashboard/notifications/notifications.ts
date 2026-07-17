import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import {
  Notification,
  TargetType,
  TargetUserType,
  SendNotificationDto,
} from '../../../core/models/notification.model';

interface ComposeForm {
  title:            string;
  body:             string;
  data_json:        string;          // optional — must be valid JSON object if filled
  target_type:      TargetType;
  target_user_type: TargetUserType;
  target_user_id:   number | null;
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
  isLoading   = false;
  showPanel   = false;
  isSending   = false;
  sendError   = '';
  sendSuccess = '';

  // Pagination
  currentPage = 1;
  limit       = 20;
  total       = 0;
  totalPages  = 0;
  pageNumbers: number[] = [];

  readonly targetTypes: { value: TargetType; label: string }[] = [
    { value: 'all',       label: 'All Users'      },
    { value: 'user_type', label: 'By User Type'   },
    { value: 'user',      label: 'Single User'    },
  ];

  readonly userTypes: TargetUserType[] = [
    'driver', 'vendor', 'admin', 'super_admin', 'fleet', 'delivery_company',
  ];

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
        this.notifications = res.data.notifications;
        this.total      = res.data.pagination?.total ?? 0;
        this.totalPages = res.data.pagination?.pages ?? (this.total > 0 ? Math.ceil(this.total / this.limit) : 1);
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
    this.form        = this.blankForm();
    this.sendError   = '';
    this.sendSuccess = '';
    this.showPanel   = true;
  }

  closePanel(): void {
    if (this.isSending) return;
    this.showPanel = false;
  }

  blankForm(): ComposeForm {
    return {
      title:            '',
      body:             '',
      data_json:        '',
      target_type:      'all',
      target_user_type: 'driver',
      target_user_id:   null,
    };
  }

  // ── Send ──────────────────────────────────────────────────
  send(): void {
    if (!this.form.title.trim()) {
      this.sendError = 'Title is required.';
      return;
    }
    if (!this.form.body.trim()) {
      this.sendError = 'Body is required.';
      return;
    }
    if (this.form.target_type === 'user' && !this.form.target_user_id) {
      this.sendError = 'User ID is required when targeting a single user.';
      return;
    }

    let parsedData: Record<string, unknown> | undefined;
    if (this.form.data_json.trim()) {
      try {
        parsedData = JSON.parse(this.form.data_json.trim());
        if (typeof parsedData !== 'object' || Array.isArray(parsedData) || parsedData === null) {
          this.sendError = 'Data must be a valid JSON object, e.g. {"type":"order","id":1}';
          return;
        }
      } catch {
        this.sendError = 'Data field contains invalid JSON.';
        return;
      }
    }

    const dto: SendNotificationDto = {
      title:       this.form.title.trim(),
      body:        this.form.body.trim(),
      target_type: this.form.target_type,
    };
    if (parsedData) dto.data = parsedData;
    if (this.form.target_type === 'user_type') dto.target_user_type = this.form.target_user_type;
    if (this.form.target_type === 'user')      dto.target_user_id   = this.form.target_user_id!;

    this.isSending = true;
    this.sendError = '';
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

  // ── Body key/input guard (max 2 lines) ───────────────────
  onBodyKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.form.body.split('\n').length >= 2) {
      event.preventDefault();
    }
  }

  onBodyInput(): void {
    const lines = this.form.body.split('\n');
    if (lines.length > 2) {
      this.form.body = lines.slice(0, 2).join('\n');
      this.cdr.detectChanges();
    }
  }

  bodyLineCount(): number {
    return this.form.body ? this.form.body.split('\n').length : 0;
  }

  // ── Helpers ───────────────────────────────────────────────
  targetLabel(n: Notification): string {
    switch (n.target_type) {
      case 'all':       return 'All Users';
      case 'user_type': return `${this.formatUserType(n.target_user_type)}`;
      case 'user':      return n.target_user ? n.target_user.name : `User #${n.target_user_id}`;
      default:          return '—';
    }
  }

  targetBadgeClass(n: Notification): string {
    const map: Record<string, string> = {
      all:       'target-all',
      user_type: 'target-type',
      user:      'target-user',
    };
    return map[n.target_type] ?? '';
  }

  formatUserType(ut: string | null): string {
    if (!ut) return '—';
    return ut.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
