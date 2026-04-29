import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteService } from '../../../core/services/favorite.service';
import { FavoriteItem } from '../../../core/models/favorite.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss',
})
export class FavoritesComponent implements OnInit {
  favorites: FavoriteItem[] = [];
  isLoading = false;
  isRemoving: Record<number, boolean> = {};
  successMessage = '';

  constructor(
    private favoriteService: FavoriteService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.favoriteService.getMyFavorites().subscribe({
      next: (res) => {
        this.favorites = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  removeFavorite(propertyId: number): void {
    this.isRemoving[propertyId] = true;
    this.favoriteService.toggle({ property_id: propertyId }).subscribe({
      next: (res) => {
        this.isRemoving[propertyId] = false;
        this.favorites = this.favorites.filter(f => f.property_id !== propertyId);
        this.successMessage = res.message || 'Removed from favorites.';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: () => {
        this.isRemoving[propertyId] = false;
        this.cdr.detectChanges();
      },
    });
  }
}
