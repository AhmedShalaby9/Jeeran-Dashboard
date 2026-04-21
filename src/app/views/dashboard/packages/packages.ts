import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PackageService } from '../../../core/services/package.service';
import { Package } from '../../../core/models/package.model';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './packages.html',
  styleUrl: './packages.scss',
})
export class PackagesComponent implements OnInit {
  packages: Package[] = [];
  isLoading = false;

  constructor(
    private packageService: PackageService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadPackages();
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

  goToNew(): void {
    this.router.navigate(['/dashboard/packages/new']);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/dashboard/packages', id]);
  }
}
