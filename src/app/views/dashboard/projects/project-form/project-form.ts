import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../../../../core/services/project.service';
import { CreateProjectDto, ProjectFeature } from '../../../../core/models/project.model';
import { MediaUploaderComponent } from '../../../../shared/components/media-uploader/media-uploader';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUploaderComponent],
  templateUrl: './project-form.html',
  styleUrl: './project-form.scss',
})
export class ProjectFormComponent {
  form: CreateProjectDto = {
    name_ar:    '',
    name_en:    '',
    main_image: null,
    gallery:    [],
    features:   [],
    is_active:  true,
  };

  // Gallery input
  galleryInput = '';

  // Feature builder — temporary state while filling a new feature
  newFeature: ProjectFeature = this.emptyFeature();
  featureImageInput = '';
  showFeatureForm   = false;

  isSubmitting = false;
  errorMessage = '';

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  private emptyFeature(): ProjectFeature {
    return { title_ar: '', title_en: '', subtitle_ar: '', subtitle_en: '', desc_ar: '', desc_en: '', images: [] };
  }

  // ── Gallery ───────────────────────────────────────────────
  addGalleryImage(): void {
    const val = this.galleryInput.trim();
    if (!val) return;
    this.form.gallery.push(val);
    this.galleryInput = '';
  }

  removeGalleryImage(index: number): void {
    this.form.gallery.splice(index, 1);
  }

  onGalleryKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addGalleryImage(); }
  }

  // ── Feature images ────────────────────────────────────────
  addFeatureImage(): void {
    const val = this.featureImageInput.trim();
    if (!val) return;
    this.newFeature.images.push(val);
    this.featureImageInput = '';
  }

  removeFeatureImage(index: number): void {
    this.newFeature.images.splice(index, 1);
  }

  onFeatureImageKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addFeatureImage(); }
  }

  // ── Feature CRUD ──────────────────────────────────────────
  openFeatureForm(): void {
    this.newFeature      = this.emptyFeature();
    this.featureImageInput = '';
    this.showFeatureForm = true;
  }

  cancelFeature(): void {
    this.showFeatureForm = false;
  }

  addFeature(): void {
    if (!this.newFeature.title_ar && !this.newFeature.title_en) return;
    this.form.features.push({ ...this.newFeature, images: [...this.newFeature.images] });
    this.showFeatureForm   = false;
    this.featureImageInput = '';
  }

  removeFeature(index: number): void {
    this.form.features.splice(index, 1);
  }

  onMainImageUploaded(urls: string[]): void {
    if (urls.length) this.form.main_image = urls[0];
  }

  onGalleryUploaded(urls: string[]): void {
    urls.forEach(url => this.form.gallery.push(url));
  }

  onFeatureImagesUploaded(urls: string[]): void {
    urls.forEach(url => this.newFeature.images.push(url));
  }

  // ── Submit ────────────────────────────────────────────────
  onSubmit(): void {
    if (!this.form.name_ar.trim()) {
      this.errorMessage = 'Arabic name (name_ar) is required.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.projectService.create(this.form).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/dashboard/projects']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to create project.';
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/projects']);
  }
}
