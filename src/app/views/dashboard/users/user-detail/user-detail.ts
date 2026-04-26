import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';
import { FavoriteService, FavoriteItem } from '../../../../core/services/favorite.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss',
})
export class UserDetailComponent implements OnInit {
  user: User | null    = null;
  isLoading            = false;
  isEditMode           = false;
  isSubmitting         = false;
  isDeleting           = false;
  showDeleteModal      = false;
  errorMessage         = '';
  successMessage       = '';

  editIsActive = false;

  // ── Favourites ─────────────────────────────────────────────
  favorites:       FavoriteItem[] = [];
  favsLoading      = false;
  favsTotal        = 0;
  favsPage         = 1;
  favsLimit        = 20;
  favsTotalPages   = 0;
  favsPageNumbers: number[] = [];
  readonly favsPageSizes = [10, 20, 50];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private favoriteService: FavoriteService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUser(id);
  }

  loadUser(id: number): void {
    this.isLoading = true;
    this.userService.getById(id).subscribe({
      next: (res) => {
        this.user      = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
        this.loadFavorites(id);
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard/users']);
      },
    });
  }

  // ── Favourites ─────────────────────────────────────────────
  loadFavorites(userId: number): void {
    this.favsLoading = true;
    this.favoriteService.getUserFavorites(userId, this.favsPage, this.favsLimit).subscribe({
      next: (res) => {
        this.favorites      = res.data;
        this.favsTotal      = res.pagination?.total ?? res.total ?? res.data.length;
        this.favsTotalPages = this.favsTotal > 0 ? Math.ceil(this.favsTotal / Number(this.favsLimit)) : 1;
        this.buildFavsPageNumbers();
        this.favsLoading    = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.favsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  buildFavsPageNumbers(): void {
    const total = this.favsTotalPages;
    const cur   = this.favsPage;
    const delta = 2;
    const pages: number[] = [];
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= cur - delta && i <= cur + delta)) pages.push(i);
    }
    const withGaps: number[] = [];
    for (let i = 0; i < pages.length; i++) {
      if (i > 0 && pages[i] - pages[i - 1] > 1) withGaps.push(-1);
      withGaps.push(pages[i]);
    }
    this.favsPageNumbers = withGaps;
  }

  favsGoToPage(page: number): void {
    if (page < 1 || page > this.favsTotalPages || page === this.favsPage) return;
    this.favsPage = page;
    this.loadFavorites(this.user!.id);
  }

  favsOnPageSizeChange(): void {
    this.favsPage = 1;
    this.loadFavorites(this.user!.id);
  }

  get favsRangeStart(): number { return Math.min((this.favsPage - 1) * Number(this.favsLimit) + 1, this.favsTotal); }
  get favsRangeEnd():   number { return Math.min(this.favsPage * Number(this.favsLimit), this.favsTotal); }

  formatPrice(price: number): string {
    if (!price) return '—';
    return new Intl.NumberFormat('ar-EG').format(price) + ' ج.م';
  }

  goToProperty(id: number): void { this.router.navigate(['/dashboard/properties', id]); }

  enableEdit(): void {
    if (!this.user) return;
    this.editIsActive  = this.user.is_active ?? true;
    this.errorMessage  = '';
    this.isEditMode    = true;
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.isEditMode   = false;
    this.errorMessage = '';
  }

  saveEdit(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.userService.update(this.user!.id, { is_active: this.editIsActive }).subscribe({
      next: (res) => {
        this.user           = res.data;
        this.isSubmitting   = false;
        this.isEditMode     = false;
        this.successMessage = 'User updated successfully!';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to update user.';
        this.cdr.detectChanges();
      },
    });
  }

  confirmDelete(): void {
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
  }

  deleteUser(): void {
    this.isDeleting = true;
    this.userService.remove(this.user!.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.router.navigate(['/dashboard/users']);
      },
      error: () => {
        this.isDeleting      = false;
        this.showDeleteModal = false;
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/users']);
  }
}
