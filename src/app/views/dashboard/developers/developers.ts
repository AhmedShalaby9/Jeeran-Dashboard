import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeveloperService } from '../../../core/services/developer.service';
import { Developer } from '../../../core/models/developer.model';

type DeveloperFilter = 'all' | 'top' | 'with-compounds' | 'no-logo' | 'verified' | 'inactive' | 'imported' | 'no-about';

@Component({
  selector: 'app-developers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './developers.html',
  styleUrl: './developers.scss',
})
export class DevelopersComponent implements OnInit {
  developers: Developer[] = [];
  isLoading = false;

  // 395+ developers: search, filters and pages all run on the loaded list
  search = '';
  filter: DeveloperFilter = 'all';
  page = 1;
  readonly pageSize = 24;
  readonly filters: { id: DeveloperFilter; label: string }[] = [
    { id: 'all', label: 'All' }, { id: 'top', label: 'Top' }, { id: 'with-compounds', label: 'With compounds' },
    { id: 'no-logo', label: 'No logo' }, { id: 'verified', label: 'Verified' }, { id: 'inactive', label: 'Inactive' },
    { id: 'imported', label: 'Imported' }, { id: 'no-about', label: 'No about info' },
  ];

  /** No description and none of the other About-tab fields (founded year, stock listing, delivered units, trust items) filled in. */
  private hasAboutInfo(d: Developer): boolean {
    return !!(d.desc_ar || d.desc_en || d.founded_year || d.stock_listing || d.delivered_units || d.trust_items?.length);
  }

  private matches(d: Developer, f: DeveloperFilter): boolean {
    switch (f) {
      case 'top': return !!d.is_top;
      case 'with-compounds': return !!d.compounds?.length;
      case 'no-logo': return !d.logo;
      case 'verified': return !!d.is_verified;
      case 'inactive': return !d.is_active;
      case 'imported': return !!d.nawy_id;
      case 'no-about': return !this.hasAboutInfo(d);
      default: return true;
    }
  }

  get filtered(): Developer[] {
    const q = this.search.trim().toLowerCase();
    return this.developers.filter((d) =>
      this.matches(d, this.filter)
      && (!q || [d.name_en, d.name_ar, d.email, d.website].some((v) => v && String(v).toLowerCase().includes(q))));
  }

  count(f: DeveloperFilter): number { return this.developers.filter((d) => this.matches(d, f)).length; }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get pageItems(): Developer[] {
    const start = (Math.min(this.page, this.totalPages) - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }
  /** Any change to the search or filter starts again from page 1. */
  reset(): void { this.page = 1; }
  go(p: number): void { this.page = Math.min(Math.max(1, p), this.totalPages); }

  constructor(
    private developerService: DeveloperService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDevelopers();
  }

  loadDevelopers(): void {
    this.isLoading = true;
    this.developerService.getAll().subscribe({
      next: (res) => {
        this.developers = res.data;
        this.isLoading  = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToNew(): void {
    this.router.navigate(['/dashboard/developers/new']);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/dashboard/developers', id]);
  }
}
