import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../../core/services/project.service';
import { Project, CreateProjectDto, ProjectFeature } from '../../../../core/models/project.model';
import { PropertyService } from '../../../../core/services/property.service';
import { Property } from '../../../../core/models/property.model';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  isLoading       = false;
  isEditMode      = false;
  isSubmitting    = false;
  isDeleting      = false;
  showDeleteModal = false;
  errorMessage    = '';
  successMessage  = '';

  // ── Properties section ─────────────────────────────────────
  properties:       Property[] = [];
  propsLoading      = false;
  propsPage         = 1;
  propsLimit        = 20;
  propsTotal        = 0;
  propsTotalPages   = 0;
  propsPageNumbers: number[] = [];
  readonly propsPageSizes = [10, 20, 50];

  editForm: CreateProjectDto = {
    name_ar: '', name_en: '', gallery: [], features: [], is_active: true,
  };

  // Gallery edit
  galleryInput = '';

  // Feature builder for edit mode
  newFeature: ProjectFeature = this.emptyFeature();
  featureImageInput  = '';
  showFeatureForm    = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private propertyService: PropertyService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProject(id);
  }

  private emptyFeature(): ProjectFeature {
    return { title_ar: '', title_en: '', subtitle_ar: '', subtitle_en: '', desc_ar: '', desc_en: '', images: [] };
  }

  loadProject(id: number): void {
    this.isLoading = true;
    this.projectService.getById(id).subscribe({
      next: (res) => {
        this.project   = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
        this.loadProperties(id);
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard/projects']);
      },
    });
  }

  // ── Properties ─────────────────────────────────────────────
  loadProperties(projectId: number): void {
    this.propsLoading = true;
    this.propertyService.getAll({
      project_id: projectId,
      page:       this.propsPage,
      limit:      this.propsLimit,
    }).subscribe({
      next: (res) => {
        this.properties     = res.data;
        this.propsTotal      = res.pagination?.total ?? res.total ?? res.data.length;
        this.propsTotalPages = this.propsTotal > 0 ? Math.ceil(this.propsTotal / Number(this.propsLimit)) : 1;
        this.buildPropsPageNumbers();
        this.propsLoading   = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.propsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  buildPropsPageNumbers(): void {
    const total = this.propsTotalPages;
    const cur   = this.propsPage;
    const delta = 2;
    const pages: number[] = [];
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= cur - delta && i <= cur + delta)) {
        pages.push(i);
      }
    }
    const withGaps: number[] = [];
    for (let i = 0; i < pages.length; i++) {
      if (i > 0 && pages[i] - pages[i - 1] > 1) withGaps.push(-1);
      withGaps.push(pages[i]);
    }
    this.propsPageNumbers = withGaps;
  }

  propsGoToPage(page: number): void {
    if (page < 1 || page > this.propsTotalPages || page === this.propsPage) return;
    this.propsPage = page;
    this.loadProperties(this.project!.id);
  }

  propsOnPageSizeChange(): void {
    this.propsPage = 1;
    this.loadProperties(this.project!.id);
  }

  get propsRangeStart(): number { return Math.min((this.propsPage - 1) * this.propsLimit + 1, this.propsTotal); }
  get propsRangeEnd():   number { return Math.min(this.propsPage * this.propsLimit, this.propsTotal); }

  goToProperty(id: number): void { this.router.navigate(['/dashboard/properties', id]); }

  formatPrice(price: number): string {
    if (!price) return '—';
    return new Intl.NumberFormat('ar-EG').format(price) + ' ج.م';
  }

  propStatusClass(status: string): string {
    const map: Record<string, string> = {
      'للبيع':   'status-sale',
      'للإيجار': 'status-rent',
      'محجوز':   'status-reserved',
      'مباع':    'status-sold',
    };
    return map[status] || '';
  }

  enableEdit(): void {
    if (!this.project) return;
    this.editForm = {
      name_ar:   this.project.name_ar,
      name_en:   this.project.name_en,
      gallery:   [...this.project.gallery],
      features:  this.project.features.map(f => ({ ...f, images: [...f.images] })),
      is_active: this.project.is_active,
    };
    this.errorMessage    = '';
    this.showFeatureForm = false;
    this.isEditMode      = true;
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.isEditMode      = false;
    this.errorMessage    = '';
    this.showFeatureForm = false;
    this.galleryInput    = '';
  }

  // ── Gallery ────────────────────────────────────────────────
  addGalleryImage(): void {
    const val = this.galleryInput.trim();
    if (!val) return;
    this.editForm.gallery.push(val);
    this.galleryInput = '';
  }

  removeGalleryImage(index: number): void {
    this.editForm.gallery.splice(index, 1);
  }

  onGalleryKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addGalleryImage(); }
  }

  // ── Feature images ─────────────────────────────────────────
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

  // ── Feature CRUD ───────────────────────────────────────────
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
    this.editForm.features.push({ ...this.newFeature, images: [...this.newFeature.images] });
    this.showFeatureForm   = false;
    this.featureImageInput = '';
  }

  removeFeature(index: number): void {
    this.editForm.features.splice(index, 1);
  }

  // ── Save ───────────────────────────────────────────────────
  saveEdit(): void {
    if (!this.editForm.name_ar.trim()) {
      this.errorMessage = 'Arabic name is required.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    this.projectService.update(this.project!.id, this.editForm).subscribe({
      next: (res) => {
        this.project        = res.data;
        this.isSubmitting   = false;
        this.isEditMode     = false;
        this.successMessage = 'Project updated successfully!';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to update project.';
        this.cdr.detectChanges();
      },
    });
  }

  // ── Delete ─────────────────────────────────────────────────
  confirmDelete(): void  { this.showDeleteModal = true; }
  cancelDelete(): void   { this.showDeleteModal = false; }

  deleteProject(): void {
    this.isDeleting = true;
    this.projectService.remove(this.project!.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.router.navigate(['/dashboard/projects']);
      },
      error: () => {
        this.isDeleting      = false;
        this.showDeleteModal = false;
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/projects']);
  }
}
