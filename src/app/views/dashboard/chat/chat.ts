import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '../../../core/services/chat.service';
import { ChatSession, Pagination } from '../../../core/models/chat.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class ChatComponent implements OnInit {
  sessions:   ChatSession[] = [];
  pagination: Pagination | null = null;
  isLoading   = false;
  page        = 1;
  limit       = 20;

  // Filters
  dateFrom   = '';
  dateTo     = '';
  dateField  = 'updated_at';

  constructor(
    private chatService: ChatService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    const filters = {
      date_from:  this.dateFrom  || undefined,
      date_to:    this.dateTo    || undefined,
      date_field: this.dateField || undefined,
    };
    this.chatService.getSessions(this.page, this.limit, filters).subscribe({
      next: (res) => {
        this.sessions   = res.data;
        this.pagination = res.pagination;
        this.isLoading  = false;
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

  clearFilters(): void {
    this.dateFrom  = '';
    this.dateTo    = '';
    this.dateField = 'updated_at';
    this.page      = 1;
    this.load();
  }

  get hasActiveFilters(): boolean {
    return !!(this.dateFrom || this.dateTo);
  }

  goTo(id: number): void {
    this.router.navigate(['/dashboard/chat', id]);
  }

  goToPage(p: number): void {
    if (!this.pagination) return;
    if (p < 1 || p > this.pagination.pages || p === this.page) return;
    this.page = p;
    this.load();
  }

  get pageNumbers(): number[] {
    if (!this.pagination) return [];
    const total = this.pagination.pages;
    const cur   = this.page;
    const pages: number[] = [];
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || Math.abs(i - cur) <= 2) pages.push(i);
    }
    return pages;
  }

  hasSubscription(session: ChatSession): boolean {
    return !!session.user?.subscription && session.user.subscription.status === 'active';
  }

  get rangeEnd(): number {
    if (!this.pagination) return 0;
    return Math.min(this.page * this.limit, this.pagination.total);
  }

  initials(name: string | undefined): string {
    return name?.charAt(0)?.toUpperCase() || '?';
  }
}
