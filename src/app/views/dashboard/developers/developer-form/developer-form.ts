import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DeveloperService } from '../../../../core/services/developer.service';
import { CreateDeveloperDto, Developer } from '../../../../core/models/developer.model';
import { MediaUploaderComponent } from '../../../../shared/components/media-uploader/media-uploader';

/** Create (`/developers/new`) and edit (`/developers/:id`) in one screen. */
@Component({
  selector: 'app-developer-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUploaderComponent],
  templateUrl: './developer-form.html',
  styleUrl: './developer-form.scss',
})
export class DeveloperFormComponent implements OnInit {
  developerId: number | null = null;
  developer: Developer | null = null;

  form: CreateDeveloperDto = {
    name_ar: '', name_en: '', logo: '', desc_ar: '', desc_en: '',
    phone: '', email: '', website: '', address: '',
    facebook: '', instagram: '', twitter: '', linkedin: '',
    is_active: true, is_verified: false,
  };

  isLoading       = false;
  isSubmitting    = false;
  isDeleting      = false;
  showDeleteModal = false;
  errorMessage    = '';
  successMessage  = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private developerService: DeveloperService,
    private cdr: ChangeDetectorRef,
  ) {}

  get isEdit(): boolean { return this.developerId !== null; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'new') return;
    this.developerId = Number(id);
    this.isLoading = true;
    this.developerService.getById(this.developerId).subscribe({
      next: (res) => {
        this.developer = res.data;
        const d = res.data;
        this.form = {
          name_ar: d.name_ar, name_en: d.name_en ?? '', logo: d.logo ?? '',
          desc_ar: d.desc_ar ?? '', desc_en: d.desc_en ?? '',
          phone: d.phone ?? '', email: d.email ?? '', website: d.website ?? '', address: d.address ?? '',
          facebook: d.facebook ?? '', instagram: d.instagram ?? '',
          twitter: d.twitter ?? '', linkedin: d.linkedin ?? '',
          is_active: d.is_active, is_verified: !!d.is_verified,
        };
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => this.router.navigate(['/dashboard/developers']),
    });
  }

  onLogoUploaded(urls: string[]): void {
    if (urls.length) this.form.logo = urls[0];
  }

  onSubmit(): void {
    if (!this.form.name_ar.trim()) {
      this.errorMessage = 'Arabic name is required.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    // Empty strings clear the field on the server.
    const payload = { ...this.form } as CreateDeveloperDto;
    const req = this.isEdit
      ? this.developerService.update(this.developerId!, payload)
      : this.developerService.create(payload);

    req.subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (this.isEdit) {
          this.developer = { ...this.developer!, ...res.data };
          this.successMessage = 'Developer saved.';
          this.cdr.detectChanges();
          setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
        } else {
          this.router.navigate(['/dashboard/developers']);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to save developer.';
        this.cdr.detectChanges();
      },
    });
  }

  confirmDelete(): void { this.showDeleteModal = true; }
  cancelDelete(): void { this.showDeleteModal = false; }

  deleteDeveloper(): void {
    this.isDeleting = true;
    this.developerService.remove(this.developerId!).subscribe({
      next: () => this.router.navigate(['/dashboard/developers']),
      error: (err) => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        // the server refuses to delete a developer that still owns projects
        this.errorMessage = err.error?.message || 'Failed to delete developer.';
        this.cdr.detectChanges();
      },
    });
  }

  openProject(id: number): void {
    this.router.navigate(['/dashboard/projects', id]);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/developers']);
  }
}
