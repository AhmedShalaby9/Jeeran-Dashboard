import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LangService, Lang } from '../../core/services/lang.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  pendingApprovalCount = 0;

  constructor(
    private authService: AuthService,
    public langService: LangService,
    private subscriptionService: SubscriptionService,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadPendingCount();
  }

  private loadPendingCount(): void {
    this.subscriptionService.getAdminAll({ status: 'pending_approval', limit: 1 }).subscribe({
      next: (res) => {
        this.pendingApprovalCount = res.meta?.total ?? res.pagination?.total ?? 0;
      },
      error: () => {},
    });
  }

  logout(): void {
    this.authService.logout();
  }

  get lang(): Lang { return this.langService.lang; }

  toggleLang(): void { this.langService.toggle(); }
}
