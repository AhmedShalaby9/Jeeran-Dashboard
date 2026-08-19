import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DeveloperService } from '../../../../core/services/developer.service';
import { Developer, CreateDeveloperDto } from '../../../../core/models/developer.model';
import { ProjectService } from '../../../../core/services/project.service';
import { Project } from '../../../../core/models/project.model';
import { TranslationService } from '../../../../core/services/translation.service';
import { MediaUploaderComponent } from '../../../../shared/components/media-uploader/media-uploader';

@Component({
  selector: 'app-developer-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUploaderComponent],
  templateUrl: './developer-detail.html',
  styleUrl: './developer-detail.scss',
})
export class DeveloperDetailComponent implements OnInit {
  developer: Developer | null = null;
  isLoading       = false;
  isEditMode      = false;
  isSubmitting    = false;
  isDeleting      = false;
  showDeleteModal = false;
  errorMessage    = '';
  successMessage  = '';

  projects: Project[] = [];
  projectsLoading = false;

  editForm: CreateDeveloperDto = {
    name_ar: '', name_en: '', logo: null,
    desc_ar: '', desc_en: '',
    phone: '', email: '', website: '', address: '',
    facebook: '', instagram: '', twitter: '', linkedin: '',
    is_active: true,
  };

  translating = {
    nameToEn: false, nameToAr: false,
    descToEn: false, descToAr: false,
  };

  translateErrors = {
    nameToEn: false, nameToAr: false,
    descToEn: false, descToAr: false,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private developerService: DeveloperService,
    private projectService: ProjectService,
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDeveloper(id);
  }

  loadDeveloper(id: number): void {
    this.isLoading = true;
    this.developerService.getById(id).subscribe({
      next: (res) => {
        this.developer = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
        this.loadProjects(id);
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard/developers']);
      },
    });
  }

  loadProjects(developerId: number): void {
    this.projectsLoading = true;
    this.projectService.getAll(undefined, developerId).subscribe({
      next: (res) => {
        this.projects = res.data;
        this.projectsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.projectsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToProject(id: number): void {
    this.router.navigate(['/dashboard/projects', id]);
  }

  enableEdit(): void {
    if (!this.developer) return;
    this.editForm = {
      name_ar:   this.developer.name_ar,
      name_en:   this.developer.name_en ?? '',
      logo:      this.developer.logo,
      desc_ar:   this.developer.desc_ar ?? '',
      desc_en:   this.developer.desc_en ?? '',
      phone:     this.developer.phone ?? '',
      email:     this.developer.email ?? '',
      website:   this.developer.website ?? '',
      address:   this.developer.address ?? '',
      facebook:  this.developer.facebook ?? '',
      instagram: this.developer.instagram ?? '',
      twitter:   this.developer.twitter ?? '',
      linkedin:  this.developer.linkedin ?? '',
      is_active: this.developer.is_active,
    };
    this.errorMessage = '';
    this.isEditMode   = true;
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.isEditMode  = false;
    this.errorMessage = '';
  }

  translateNameToEn(): void {
    if (!this.editForm.name_ar?.trim() || this.translating.nameToEn) return;
    this.translating.nameToEn = true; this.translateErrors.nameToEn = false;
    this.translationService.translate(this.editForm.name_ar, 'ar', 'en').subscribe(r => {
      if (r !== null) this.editForm.name_en = r; else this.translateErrors.nameToEn = true;
      this.translating.nameToEn = false; this.cdr.detectChanges();
    });
  }

  translateNameToAr(): void {
    if (!this.editForm.name_en?.trim() || this.translating.nameToAr) return;
    this.translating.nameToAr = true; this.translateErrors.nameToAr = false;
    this.translationService.translate(this.editForm.name_en!, 'en', 'ar').subscribe(r => {
      if (r !== null) this.editForm.name_ar = r; else this.translateErrors.nameToAr = true;
      this.translating.nameToAr = false; this.cdr.detectChanges();
    });
  }

  translateDescToEn(): void {
    if (!this.editForm.desc_ar?.trim() || this.translating.descToEn) return;
    this.translating.descToEn = true; this.translateErrors.descToEn = false;
    this.translationService.translate(this.editForm.desc_ar!, 'ar', 'en').subscribe(r => {
      if (r !== null) this.editForm.desc_en = r; else this.translateErrors.descToEn = true;
      this.translating.descToEn = false; this.cdr.detectChanges();
    });
  }

  translateDescToAr(): void {
    if (!this.editForm.desc_en?.trim() || this.translating.descToAr) return;
    this.translating.descToAr = true; this.translateErrors.descToAr = false;
    this.translationService.translate(this.editForm.desc_en!, 'en', 'ar').subscribe(r => {
      if (r !== null) this.editForm.desc_ar = r; else this.translateErrors.descToAr = true;
      this.translating.descToAr = false; this.cdr.detectChanges();
    });
  }

  onLogoUploaded(urls: string[]): void {
    if (urls.length) this.editForm.logo = urls[0];
  }

  saveEdit(): void {
    if (!this.editForm.name_ar.trim()) {
      this.errorMessage = 'Arabic name is required.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    this.developerService.update(this.developer!.id, this.editForm).subscribe({
      next: (res) => {
        this.developer      = res.data;
        this.isSubmitting   = false;
        this.isEditMode     = false;
        this.successMessage = 'Developer updated successfully!';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to update developer.';
        this.cdr.detectChanges();
      },
    });
  }

  confirmDelete(): void  { this.showDeleteModal = true; }
  cancelDelete(): void   { this.showDeleteModal = false; }

  deleteDeveloper(): void {
    this.isDeleting = true;
    this.developerService.remove(this.developer!.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.router.navigate(['/dashboard/developers']);
      },
      error: () => {
        this.isDeleting      = false;
        this.showDeleteModal = false;
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void { this.router.navigate(['/dashboard/developers']); }
}
