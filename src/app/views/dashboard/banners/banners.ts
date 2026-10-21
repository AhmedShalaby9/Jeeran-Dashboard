import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BannerService } from '../../../core/services/banner.service';
import { Banner } from '../../../core/models/banner.model';

@Component({
  selector: 'app-banners',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banners.html',
  styleUrl: './banners.scss',
})
export class BannersComponent implements OnInit {
  banners: Banner[] = [];
  isLoading = false;

  constructor(
    private bannerService: BannerService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadBanners();
  }

  loadBanners(): void {
    this.isLoading = true;
    this.bannerService.getAll().subscribe({
      next: (res) => {
        this.banners   = res.data;
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
    this.router.navigate(['/dashboard/banners/new']);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/dashboard/banners', id]);
  }
}
