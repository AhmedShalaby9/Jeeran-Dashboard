import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AiAdService } from '../../../../core/services/ai-ad.service';
import { AiAd } from '../../../../core/models/ai-ad.model';

@Component({
  selector: 'app-ai-ad-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-ad-detail.html',
  styleUrl: './ai-ad-detail.scss',
})
export class AiAdDetailComponent implements OnInit {
  ad: AiAd | null = null;
  trials: AiAd[] = [];
  isLoading = true;
  loadError = '';
  trialsLoading = false;
  expandedTrial: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private aiAdService: AiAdService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAd(id);
  }

  loadAd(id: number): void {
    this.isLoading = true;
    this.aiAdService.adminGet(id).subscribe({
      next: (res) => {
        this.ad = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
        if (res.data.status === 'done') {
          this.loadTrials(id);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.loadError = err?.error?.message || 'Failed to load AI ad.';
        this.cdr.detectChanges();
      },
    });
  }

  loadTrials(id: number): void {
    this.trialsLoading = true;
    this.aiAdService.adminListTrials(id).subscribe({
      next: (res) => {
        this.trials = res.data;
        this.trialsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.trialsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleTrial(id: number): void {
    this.expandedTrial = this.expandedTrial === id ? null : id;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      awaiting_payment: 'Awaiting Payment',
      pending: 'Pending',
      done:    'Done',
      failed:  'Failed',
    };
    return map[status] ?? status;
  }

  goBack(): void {
    this.router.navigate(['/dashboard/ai-ads']);
  }
}
