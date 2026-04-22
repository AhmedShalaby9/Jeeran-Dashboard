import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
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
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard/users']);
      },
    });
  }

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
