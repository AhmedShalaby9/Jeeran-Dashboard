import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SellerRequestService } from '../../../../core/services/seller-request.service';
import { SellerRequest } from '../../../../core/models/seller-request.model';

@Component({
  selector: 'app-seller-request-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seller-request-detail.html',
  styleUrl: './seller-request-detail.scss',
})
export class SellerRequestDetailComponent implements OnInit {
  request: SellerRequest | null = null;
  isLoading    = false;
  isActing     = false;
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
    this.sellerRequestService.approve(this.request.id).subscribe({
      next: (res) => {
        this.request       = res.data;
        this.isActing      = false;
        this.successMessage = 'Request approved successfully.';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.isActing    = false;
        this.errorMessage = err.error?.message || 'Failed to approve request.';
        this.cdr.detectChanges();
      },
    });
  }

  reject(): void {
    if (!this.request) return;
    this.isActing = true;
    this.sellerRequestService.reject(this.request.id).subscribe({
      next: (res) => {
        this.request       = res.data;
        this.isActing      = false;
        this.successMessage = 'Request rejected.';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.isActing    = false;
        this.errorMessage = err.error?.message || 'Failed to reject request.';
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/seller-requests']);
  }
}
