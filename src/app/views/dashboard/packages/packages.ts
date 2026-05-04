import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PackageService } from '../../../core/services/package.service';
import { Package } from '../../../core/models/package.model';
import { LangService, Lang } from '../../../core/services/lang.service';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './packages.html',
  styleUrl: './packages.scss',
})
export class PackagesComponent implements OnInit, OnDestroy {
  packages: Package[] = [];
  isLoading = false;
  lang: Lang = 'en';

  private langSub!: Subscription;

  constructor(
    private packageService: PackageService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private langService: LangService,
  ) {}

  ngOnInit(): void {
    this.lang = this.langService.lang;
    this.langSub = this.langService.lang$.subscribe(l => {
      this.lang = l;
      this.cdr.detectChanges();
    });
    this.loadPackages();
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  loadPackages(): void {
    this.isLoading = true;
    this.packageService.getAll().subscribe({
      next: (res) => {
        this.packages  = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  pkgTitle(pkg: Package): string {
    return (this.lang === 'ar' ? pkg.title_ar : pkg.title_en) || pkg.title_en || pkg.title_ar || '—';
  }

  pkgDesc(pkg: Package): string {
    return (this.lang === 'ar' ? pkg.description_ar : pkg.description_en) || '—';
  }

  goToNew(): void {
    this.router.navigate(['/dashboard/packages/new']);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/dashboard/packages', id]);
  }
}
