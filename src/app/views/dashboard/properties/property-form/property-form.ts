import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PropertyService } from '../../../../core/services/property.service';
import { CreatePropertyDto } from '../../../../core/models/property.model';
import { MediaUploaderComponent } from '../../../../shared/components/media-uploader/media-uploader';

interface StepMeta {
  index:    number;
  label:    string;
  sublabel: string;
  icon:     string;
}

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUploaderComponent],
  templateUrl: './property-form.html',
  styleUrl: './property-form.scss',
})
export class PropertyFormComponent {

  readonly steps: StepMeta[] = [
    { index: 0, label: 'Basic Info',   sublabel: 'Title, type & price',    icon: 'info'   },
    { index: 1, label: 'Location',     sublabel: 'Address & details',      icon: 'pin'    },
    { index: 2, label: 'Media',        sublabel: 'Photos & video',         icon: 'camera' },
    { index: 3, label: 'Agent',        sublabel: 'Contact & settings',     icon: 'agent'  },
  ];

  currentStep = 0;

  form: CreatePropertyDto = {
    title:           '',
    slug:            '',
    content:         '',
    content_html:    '',
    property_type:   'فيلا',
    property_status: 'للبيع',
    price:           0,
    size:            null,
    bedrooms:        null,
    bathrooms:       null,
    country:         'مصر',
    state:           '',
    project_id:      null,
    images:          [],
    video_url:       '',
    is_featured:     false,
    is_active:       true,
    published_at:    null,
    views_count:     0,
    legacy_code:     '',
    agent_name:      '',
    agent_mobile:    '',
    agent_whatsapp:  '',
    agent_email:     '',
    agent_picture:   '',
  };

  imageInput      = '';
  stepErrors: string[] = ['', '', '', ''];
  isSubmitting    = false;
  globalError     = '';

  readonly propertyTypes    = ['فيلا', 'شقة', 'دوبلكس', 'بنتهاوس', 'تاون هاوس', 'استوديو', 'محل', 'مكتب', 'عيادة', 'أرض'];
  readonly propertyStatuses = ['للبيع', 'للإيجار', 'محجوز', 'مباع'];
  readonly countries        = ['مصر', 'السعودية', 'الإمارات', 'الكويت', 'الأردن', 'البحرين', 'قطر', 'عُمان'];

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  // ── Step validation ───────────────────────────────────────
  validateStep(step: number): boolean {
    this.stepErrors[step] = '';
    if (step === 0) {
      if (!this.form.title.trim()) { this.stepErrors[0] = 'Property title is required.'; return false; }
      if (!this.form.property_type) { this.stepErrors[0] = 'Property type is required.'; return false; }
      if (!this.form.price || this.form.price <= 0) { this.stepErrors[0] = 'A valid price is required.'; return false; }
    }
    return true;
  }

  // ── Navigation ────────────────────────────────────────────
  next(): void {
    if (!this.validateStep(this.currentStep)) { this.cdr.detectChanges(); return; }
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.cdr.detectChanges();
    }
  }

  prev(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.cdr.detectChanges();
    }
  }

  goToStep(index: number): void {
    // Allow going back freely, going forward only if current step validates
    if (index < this.currentStep) {
      this.currentStep = index;
      this.cdr.detectChanges();
      return;
    }
    // Validate all steps up to target
    for (let i = this.currentStep; i < index; i++) {
      if (!this.validateStep(i)) { this.currentStep = i; this.cdr.detectChanges(); return; }
    }
    this.currentStep = index;
    this.cdr.detectChanges();
  }

  // ── Images ────────────────────────────────────────────────
  addImage(): void {
    const v = this.imageInput.trim();
    if (!v) return;
    this.form.images.push(v);
    this.imageInput = '';
  }

  removeImage(i: number): void {
    this.form.images.splice(i, 1);
  }

  onImageKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') { e.preventDefault(); this.addImage(); }
  }

  onImagesUploaded(urls: string[]): void {
    urls.forEach(url => this.form.images.push(url));
  }

  onAgentPictureUploaded(urls: string[]): void {
    if (urls.length) this.form.agent_picture = urls[0];
  }

  // ── Auto-slug ─────────────────────────────────────────────
  autoSlug(): void {
    if (this.form.slug) return; // don't overwrite manual slug
    this.form.slug = this.form.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06ff-]/g, '')
      .substring(0, 80);
  }

  // ── Submit ────────────────────────────────────────────────
  onSubmit(): void {
    for (let i = 0; i < this.steps.length; i++) {
      if (!this.validateStep(i)) {
        this.currentStep = i;
        this.cdr.detectChanges();
        return;
      }
    }

    this.isSubmitting = true;
    this.globalError  = '';

    // Clean up empty optional strings to null
    const payload: CreatePropertyDto = {
      ...this.form,
      content:       this.form.content?.trim()       || null,
      content_html:  this.form.content_html?.trim()  || null,
      video_url:     this.form.video_url?.trim()      || null,
      legacy_code:   this.form.legacy_code?.trim()    || null,
      agent_name:    this.form.agent_name?.trim()     || null,
      agent_mobile:  this.form.agent_mobile?.trim()   || null,
      agent_whatsapp:this.form.agent_whatsapp?.trim() || null,
      agent_email:   this.form.agent_email?.trim()    || null,
      agent_picture: this.form.agent_picture?.trim()  || null,
      state:         this.form.state?.trim()           || null,
      country:       this.form.country?.trim()         || null,
    };

    this.propertyService.create(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/dashboard/properties']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.globalError  = err.error?.message || 'Failed to create property.';
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/properties']);
  }
}
