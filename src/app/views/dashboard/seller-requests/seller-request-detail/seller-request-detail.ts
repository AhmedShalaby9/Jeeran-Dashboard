import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SellerRequestService } from '../../../../core/services/seller-request.service';
import { SellerRequest } from '../../../../core/models/seller-request.model';

@Component({
  selector: 'app-seller-request-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller-request-detail.html',
  styleUrl: './seller-request-detail.scss',
})
export class SellerRequestDetailComponent implements OnInit {
  request: SellerRequest | null = null;
  isLoading    = false;
  isActing     = false;
  showRejectModal = false;
  rejectReason    = '';
  readonly reasonMax = 1000;
  successMessage = '';
  errorMessage   = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sellerRequestService: SellerRequestService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.load(id);
  }

  load(id: number): void {
    this.isLoading = true;
    this.sellerRequestService.getById(id).subscribe({
      next: (res) => {
        this.request   = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard/seller-requests']);
      },
    });
  }

  approve(): void {
    if (!this.request) return;
    this.isActing = true;
    this.errorMessage = '';
    this.sellerRequestService.approve(this.request.id).subscribe({
      next: () => this.afterAction('Request approved successfully.'),
      error: (err) => this.actionFailed(err, 'Failed to approve request.'),
    });
  }

  openReject(): void {
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  cancelReject(): void {
    this.showRejectModal = false;
  }

  confirmReject(): void {
    if (!this.request) return;
    this.isActing = true;
    this.errorMessage = '';
    this.sellerRequestService.reject(this.request.id, this.rejectReason).subscribe({
      next: () => {
        this.showRejectModal = false;
        this.afterAction('Request rejected. The applicant was notified.');
      },
      error: (err) => {
        this.showRejectModal = false;
        this.actionFailed(err, 'Failed to reject request.');
      },
    });
  }

  private afterAction(message: string): void {
    const id = this.request!.id;
    this.isActing = false;
    this.successMessage = message;
    this.load(id); // approve/reject don't return the record
    setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 4000);
  }

  private actionFailed(err: any, fallback: string): void {
    this.isActing = false;
    this.errorMessage = err.error?.message || fallback;
    this.cdr.detectChanges();
  }

  goBack(): void {
    this.router.navigate(['/dashboard/seller-requests']);
  }
}
