import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdService } from '../../../core/services/ad.service';
import { Ad } from '../../../core/models/ad.model';

@Component({
  selector: 'app-ads',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ads.html',
  styleUrl: './ads.scss',
})
export class AdsComponent implements OnInit {
  adsList: Ad[] = [];
  isLoading = false;

  constructor(
    private adService: AdService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.adService.getAll().subscribe({
      next: (res) => {
        this.adsList = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToNew(): void {
    this.router.navigate(['/dashboard/ads/new']);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/dashboard/ads', id]);
  }
}
