import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PromotionService } from '../../../core/services/promotion.service';
import { Promotion, promotionStatus } from '../../../core/models/promotion.model';

/** Launches & offers — what is running on which compound, and the history. */
@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './promotions.html',
  styleUrl: './promotions.scss',
})
export class PromotionsComponent implements OnInit {
  all: Promotion[] = [];
  view: 'live' | 'all' = 'live';
  isLoading = false;
  errorMessage = '';

  readonly status = promotionStatus;

  constructor(private promotionService: PromotionService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  get rows(): Promotion[] {
    return this.view === 'live' ? this.all.filter((p) => promotionStatus(p) === 'live') : this.all;
  }

  get liveCount(): number { return this.all.filter((p) => promotionStatus(p) === 'live').length; }

  load(): void {
    this.isLoading = true;
    this.promotionService.getAll({ all: true }).subscribe({
      next: (res) => { this.all = res.data; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); },
    });
  }

  setView(v: 'live' | 'all'): void { this.view = v; }

  goToNew(): void { this.router.navigate(['/dashboard/promotions/new']); }
  openCompound(p: Promotion): void { this.router.navigate(['/dashboard/compounds', p.compound_id]); }

  end(p: Promotion): void {
    this.promotionService.end(p.id).subscribe({
      next: () => this.load(),
      error: (err) => { this.errorMessage = err.error?.message || 'Failed to end the promotion.'; this.cdr.detectChanges(); },
    });
  }
}
