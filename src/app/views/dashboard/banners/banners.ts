import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BannerService } from '../../../core/services/banner.service';
import { AdStudioService } from '../../../core/services/ad-studio.service';
import { AdDraft, Banner, BANNER_STATUS_LABEL, BannerStatus, bannerStatus, isStudioAd } from '../../../core/models/banner.model';

type Tab = 'all' | 'studio' | 'paused' | 'drafts';

@Component({
  selector: 'app-banners',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banners.html',
  styleUrl: './banners.scss',
})
export class BannersComponent implements OnInit {
  banners: Banner[] = [];
  drafts: AdDraft[] = [];
  isLoading = false;
  tab: Tab = 'all';
  checking = false;
  notice = '';

  constructor(
    private bannerService: BannerService,
    private adStudio: AdStudioService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadBanners();
    this.loadDrafts();
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

  loadDrafts(): void {
    this.adStudio.drafts().subscribe({
      next: (res) => { this.drafts = res.data; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  status(b: Banner): BannerStatus { return bannerStatus(b); }
  statusLabel(b: Banner): string { return BANNER_STATUS_LABEL[bannerStatus(b)]; }
  isStudio(b: Banner): boolean { return isStudioAd(b); }

  get studioCount(): number { return this.banners.filter((b) => isStudioAd(b)).length; }
  get pausedCount(): number { return this.banners.filter((b) => bannerStatus(b) === 'paused').length; }

  get shown(): Banner[] {
    if (this.tab === 'studio') return this.banners.filter((b) => isStudioAd(b));
    if (this.tab === 'paused') return this.banners.filter((b) => bannerStatus(b) === 'paused');
    return this.banners;
  }

  setTab(t: Tab): void { this.tab = t; }

  /** Re-reads every running ad's numbers now (the server also does it every 30 minutes). */
  checkPrices(): void {
    this.checking = true;
    this.notice = '';
    this.adStudio.checkNow().subscribe({
      next: (res) => {
        this.checking = false;
        const n = res.data.paused.length;
        this.notice = n === 0 ? 'Every ad matches the live numbers.' : `${n} ad${n === 1 ? '' : 's'} paused: a number changed.`;
        this.loadBanners();
        this.cdr.detectChanges();
      },
      error: () => { this.checking = false; this.notice = 'Could not check the ads. Try again.'; this.cdr.detectChanges(); },
    });
  }

  discardDraft(d: AdDraft, ev: Event): void {
    ev.stopPropagation();
    this.adStudio.discard(d.id).subscribe({
      next: () => { this.drafts = this.drafts.filter((x) => x.id !== d.id); this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  goToNew(): void {
    this.router.navigate(['/dashboard/banners/new']);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/dashboard/banners', id]);
  }
}
