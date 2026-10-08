import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AreaService } from '../../../core/services/area.service';
import { AREA_STATES, Area, CreateAreaDto } from '../../../core/models/area.model';
import { MediaUploaderComponent } from '../../../shared/components/media-uploader/media-uploader';

/** Areas — the places people search by. Create, edit and delete in one screen. */
@Component({
  selector: 'app-areas',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUploaderComponent],
  templateUrl: './areas.html',
  styleUrl: './areas.scss',
})
export class AreasComponent implements OnInit {
  areas: Area[] = [];
  isLoading = false;
  readonly states = AREA_STATES;

  showModal = false;
  editing: Area | null = null;
  form: CreateAreaDto = this.blank();
  isSubmitting = false;
  errorMessage = '';
  pageError = '';

  deleting: Area | null = null;
  isDeleting = false;

  constructor(private areaService: AreaService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  private blank(): CreateAreaDto {
    return { name_ar: '', name_en: '', state: null, image: '', sort_order: 0, is_active: true };
  }

  load(): void {
    this.isLoading = true;
    this.areaService.getAll().subscribe({
      next: (res) => { this.areas = res.data; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); },
    });
  }

  stateLabel(v: string | null): string {
    return this.states.find((s) => s.value === v)?.label ?? '—';
  }

  openNew(): void {
    this.editing = null;
    this.form = { ...this.blank(), sort_order: this.areas.length + 1 };
    this.errorMessage = '';
    this.showModal = true;
  }

  openEdit(a: Area): void {
    this.editing = a;
    this.form = {
      name_ar: a.name_ar, name_en: a.name_en ?? '', state: a.state, image: a.image ?? '',
      sort_order: a.sort_order, is_active: a.is_active,
    };
    this.errorMessage = '';
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  onImageUploaded(urls: string[]): void { if (urls.length) this.form.image = urls[0]; }

  save(): void {
    if (!this.form.name_ar.trim()) { this.errorMessage = 'Arabic name is required.'; return; }
    this.isSubmitting = true;
    this.errorMessage = '';
    const req = this.editing
      ? this.areaService.update(this.editing.id, this.form)
      : this.areaService.create(this.form);
    req.subscribe({
      next: () => { this.isSubmitting = false; this.showModal = false; this.load(); },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to save the area.';
        this.cdr.detectChanges();
      },
    });
  }

  confirmDelete(a: Area): void { this.deleting = a; }
  cancelDelete(): void { this.deleting = null; }

  doDelete(): void {
    if (!this.deleting) return;
    this.isDeleting = true;
    this.areaService.remove(this.deleting.id).subscribe({
      next: () => { this.isDeleting = false; this.deleting = null; this.load(); },
      error: (err) => {
        this.isDeleting = false;
        this.deleting = null;
        this.pageError = err.error?.message || 'Failed to delete the area.';
        this.cdr.detectChanges();
      },
    });
  }
}
