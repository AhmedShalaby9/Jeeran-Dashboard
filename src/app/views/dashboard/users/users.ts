import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User, UserType } from '../../../core/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  isLoading = false;

  filterType: UserType | '' = '';
  filterActive: '' | 'true' | 'false' = '';
  filterSearch = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    const filters: any = {};
    if (this.filterType)   filters.user_type = this.filterType as UserType;
    if (this.filterActive) filters.is_active = this.filterActive === 'true';
    if (this.filterSearch) filters.search    = this.filterSearch;

    this.userService.getAll(filters).subscribe({
      next: (res) => {
        this.users     = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onFilterChange(): void {
    this.loadUsers();
  }

  goToNew(): void {
    this.router.navigate(['/dashboard/users/new']);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/dashboard/users', id]);
  }
}
