import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../../../core/services/property.service';
import { Property, CreatePropertyDto, PropertyType, PropertyStatus, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from '../../../../core/models/property.model';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.scss',
})
export class PropertyDetailComponent implements OnInit {
  property:       Property | null = null;
  isLoading       = false;
  isEditMode      = false;
  isSubmitting    = false;
  isDeleting      = false;
  showDeleteModal = false;
  errorMessage    = '';
  successMessage  = '';

  editForm: Partial<CreatePropertyDto> = {};
  imageInput = '';

  // Lightbox
  lightboxIndex: number | null = null;

  readonly propertyTypes: { value: PropertyType; en: string; ar: string }[] =
    (Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map(key => ({
      value: key, ...PROPERTY_TYPE_LABELS[key],
    }));

  readonly propertyStatuses: { value: PropertyStatus; en: string; ar: string }[] =
    (Object.keys(PROPERTY_STATUS_LABELS) as PropertyStatus[]).map(key => ({
      value: key, ...PROPERTY_STATUS_LABELS[key],
    }));

  typeLabel(type: string, lang: 'en' | 'ar' = 'en'): string {
    return PROPERTY_TYPE_LABELS[type as PropertyType]?.[lang] ?? type;
  }

  statusLabel(status: string, lang: 'en' | 'ar' = 'en'): string {
    return PROPERTY_STATUS_LABELS[status as PropertyStatus]?.[lang] ?? status;
  }

  readonly states = [
    { value: 'cairo',           label: 'القاهرة'         },
    { value: 'north_coast',     label: 'الساحل الشمالي'  },
    { value: 'sharm_el_sheikh', label: 'شرم الشيخ'       },
  ];
  readonly stateLabels: Record<string, string> = Object.fromEntries(
    this.states.map(s => [s.value, s.label])
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.load(id);
  }

  load(id: number): void {
    this.isLoading = true;
    this.propertyService.getById(id).subscribe({
      next: (res) => {
        this.property  = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard/properties']);
      },
    });
  }

  enableEdit(): void {
    if (!this.property) return;
    this.editForm = {
      title:           this.property.title,
      title_ar:        this.property.title_ar,
      title_en:        this.property.title_en,
      slug:            this.property.slug,
      content:         this.property.content,
      content_ar:      this.property.content_ar,
      content_en:      this.property.content_en,
      content_html:    this.property.content_html,
      property_type:   this.property.property_type,
      property_status: this.property.property_status,
      price:           this.property.price,
      size:            this.property.size,
      bedrooms:        this.property.bedrooms,
      bathrooms:       this.property.bathrooms,
      country:         this.property.country,
      state:           this.property.state,
      project_id:      this.property.project_id,
      images:          [...(this.property.images || [])],
      video_url:       this.property.video_url,
      is_featured:     this.property.is_featured,
      is_active:       this.property.is_active,
      agent_name:      this.property.agent_name,
      agent_mobile:    this.property.agent_mobile,
      agent_whatsapp:  this.property.agent_whatsapp,
      agent_email:     this.property.agent_email,
      agent_picture:   this.property.agent_picture,
    };
    this.errorMessage = '';
    this.imageInput   = '';
    this.isEditMode   = true;
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.isEditMode   = false;
    this.errorMessage = '';
    this.imageInput   = '';
  }

  addImage(): void {
    const v = this.imageInput.trim();
    if (!v) return;
    this.editForm.images = [...(this.editForm.images || []), v];
    this.imageInput = '';
  }

  removeImage(i: number): void {
    this.editForm.images = (this.editForm.images || []).filter((_, idx) => idx !== i);
  }

  onImageKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') { e.preventDefault(); this.addImage(); }
  }

  saveEdit(): void {
    if (!this.editForm.title_ar?.trim() && !this.editForm.title?.trim() && !this.editForm.title_en?.trim()) {
      this.errorMessage = 'At least one property title is required.';
      return;
    }
    if (!this.editForm.property_type) { this.errorMessage = 'Property type is required.'; return; }
    this.isSubmitting = true;
    this.errorMessage = '';

    this.propertyService.update(this.property!.id, this.editForm).subscribe({
      next: (res) => {
        this.property       = res.data;
        this.isSubmitting   = false;
        this.isEditMode     = false;
        this.successMessage = 'Property updated successfully!';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to update property.';
        this.cdr.detectChanges();
      },
    });
  }

  confirmDelete(): void  { this.showDeleteModal = true; }
  cancelDelete(): void   { this.showDeleteModal = false; }

  deleteProperty(): void {
    this.isDeleting = true;
    this.propertyService.remove(this.property!.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.router.navigate(['/dashboard/properties']);
      },
      error: () => {
        this.isDeleting      = false;
        this.showDeleteModal = false;
        this.cdr.detectChanges();
      },
    });
  }

  formatPrice(price: number): string {
    if (!price) return '—';
    return new Intl.NumberFormat('ar-EG').format(price) + ' ج.م';
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      for_sale:           'status-sale',
      for_rent:           'status-rent',
      for_rent_furnished: 'status-rent-furnished',
    };
    return map[status] || '';
  }

  openLightbox(index: number): void  { this.lightboxIndex = index; }
  closeLightbox(): void               { this.lightboxIndex = null; }
  lightboxPrev(): void {
    if (this.lightboxIndex === null || !this.property) return;
    this.lightboxIndex = (this.lightboxIndex - 1 + this.property.images.length) % this.property.images.length;
  }
  lightboxNext(): void {
    if (this.lightboxIndex === null || !this.property) return;
    this.lightboxIndex = (this.lightboxIndex + 1) % this.property.images.length;
  }
  onLightboxKey(event: KeyboardEvent): void {
    if (event.key === 'Escape')     this.closeLightbox();
    if (event.key === 'ArrowLeft')  this.lightboxPrev();
    if (event.key === 'ArrowRight') this.lightboxNext();
  }

  goBack(): void { this.router.navigate(['/dashboard/properties']); }
}
