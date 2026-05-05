import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PropertyService } from '../../../../core/services/property.service';
import { ProjectService } from '../../../../core/services/project.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { CreatePropertyDto, PropertyType, PropertyStatus, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from '../../../../core/models/property.model';
import { Project } from '../../../../core/models/project.model';
import { MediaUploaderComponent } from '../../../../shared/components/media-uploader/media-uploader';

interface StepMeta {
  index:    number;
  label:    string;
  sublabel: string;
  icon:     string;
}

const DEFAULT_AGENT = {
  agent_name:     'Mahmoud Khalil',
  agent_mobile:   '+201005464855',
  agent_whatsapp: '+201005464855',
  agent_email:    'mahkhalil1984@gmail.com',
  agent_picture:  '',
};

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUploaderComponent],
  templateUrl: './property-form.html',
  styleUrl: './property-form.scss',
})
export class PropertyFormComponent implements OnInit {

  readonly steps: StepMeta[] = [
    { index: 0, label: 'Basic Info',   sublabel: 'Title, type & price',    icon: 'info'   },
    { index: 1, label: 'Location',     sublabel: 'Address & details',      icon: 'pin'    },
    { index: 2, label: 'Media',        sublabel: 'Photos & video',         icon: 'camera' },
    { index: 3, label: 'Agent',        sublabel: 'Contact & settings',     icon: 'agent'  },
  ];

  currentStep = 0;

  // ── Enum options ──────────────────────────────────────────
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
    { value: 'cairo',           label: 'Cairo'         },
    { value: 'north_coast',     label: 'North Coast'   },
    { value: 'sharm_el_sheikh', label: 'Sharm El Sheikh' },
  ];

  readonly countries = [
    { value: 'egypt', label: 'Egypt' },
  ];

  // ── Projects for dropdown ─────────────────────────────────
  projects: Project[] = [];

  // ── Default agent ─────────────────────────────────────────
  readonly defaultAgent = DEFAULT_AGENT;

  form: CreatePropertyDto = {
    title_ar:        '',
    title_en:        '',
    slug:            '',
    content_ar:      '',
    content_en:      '',
    content_html:    '',
    property_type:   'villa',
    property_status: 'for_sale',
    price:           0,
    size:            null,
    bedrooms:        null,
    bathrooms:       null,
    country:         'egypt',
    state:           'cairo',
    project_id:      null,
    images:          [],
    video_url:       '',
    is_featured:     false,
    is_active:       true,
    published_at:    null,
    views_count:     0,
    legacy_code:     '',
    agent_name:      DEFAULT_AGENT.agent_name,
    agent_mobile:    DEFAULT_AGENT.agent_mobile,
    agent_whatsapp:  DEFAULT_AGENT.agent_whatsapp,
    agent_email:     DEFAULT_AGENT.agent_email,
    agent_picture:   DEFAULT_AGENT.agent_picture,
  };

  imageInput   = '';
  stepErrors: string[] = ['', '', '', ''];
  isSubmitting = false;
  globalError  = '';

  // ── Translation state ─────────────────────────────────────
  translating = {
    titleToEn:  false,
    titleToAr:  false,
    descToEn:   false,
    descToAr:   false,
  };

  constructor(
    private propertyService:   PropertyService,
    private projectService:    ProjectService,
    private translationService: TranslationService,
    private router:            Router,
    private cdr:               ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (res) => { this.projects = res.data; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  // ── Helpers ───────────────────────────────────────────────

  get stateLabel(): string {
    return this.states.find(s => s.value === this.form.state)?.label || this.form.state || '';
  }

  // ── Translation ───────────────────────────────────────────
  translateTitleToEn(): void {
    if (!this.form.title_ar?.trim() || this.translating.titleToEn) return;
    this.translating.titleToEn = true;
    this.translationService.translate(this.form.title_ar, 'ar', 'en').subscribe(result => {
      if (result) this.form.title_en = result;
      this.translating.titleToEn = false;
      this.cdr.detectChanges();
    });
  }

  translateTitleToAr(): void {
    if (!this.form.title_en?.trim() || this.translating.titleToAr) return;
    this.translating.titleToAr = true;
    this.translationService.translate(this.form.title_en, 'en', 'ar').subscribe(result => {
      if (result) this.form.title_ar = result;
      this.translating.titleToAr = false;
      this.cdr.detectChanges();
    });
  }

  translateDescToEn(): void {
    if (!this.form.content_ar?.trim() || this.translating.descToEn) return;
    this.translating.descToEn = true;
    this.translationService.translate(this.form.content_ar, 'ar', 'en').subscribe(result => {
      if (result) this.form.content_en = result;
      this.translating.descToEn = false;
      this.cdr.detectChanges();
    });
  }

  translateDescToAr(): void {
    if (!this.form.content_en?.trim() || this.translating.descToAr) return;
    this.translating.descToAr = true;
    this.translationService.translate(this.form.content_en, 'en', 'ar').subscribe(result => {
      if (result) this.form.content_ar = result;
      this.translating.descToAr = false;
      this.cdr.detectChanges();
    });
  }

  // ── Step validation ───────────────────────────────────────
  validateStep(step: number): boolean {
    this.stepErrors[step] = '';
    if (step === 0) {
      if (!this.form.title_ar?.trim() && !this.form.title_en?.trim()) {
        this.stepErrors[0] = 'At least one property title (Arabic or English) is required.';
        return false;
      }
      if (!this.form.property_type) {
        this.stepErrors[0] = 'Property type is required.';
        return false;
      }
      if (!this.form.price || this.form.price <= 0) {
        this.stepErrors[0] = 'A valid price is required.';
        return false;
      }
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
    if (index < this.currentStep) {
      this.currentStep = index;
      this.cdr.detectChanges();
      return;
    }
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
    if (this.form.slug) return;
    const base = this.form.title_en?.trim() || this.form.title_ar?.trim() || '';
    this.form.slug = base
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w؀-ۿ-]/g, '')
      .substring(0, 80);
  }

  // ── Agent defaults ────────────────────────────────────────
  resetAgent(): void {
    this.form.agent_name     = this.defaultAgent.agent_name;
    this.form.agent_mobile   = this.defaultAgent.agent_mobile;
    this.form.agent_whatsapp = this.defaultAgent.agent_whatsapp;
    this.form.agent_email    = this.defaultAgent.agent_email;
    this.form.agent_picture  = this.defaultAgent.agent_picture;
    this.cdr.detectChanges();
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

    const payload: CreatePropertyDto = {
      ...this.form,
      title_ar:       this.form.title_ar?.trim()       || null,
      title_en:       this.form.title_en?.trim()       || null,
      content_ar:     this.form.content_ar?.trim()     || null,
      content_en:     this.form.content_en?.trim()     || null,
      content_html:   this.form.content_html?.trim()   || null,
      video_url:      this.form.video_url?.trim()       || null,
      legacy_code:    this.form.legacy_code?.trim()     || null,
      agent_name:     this.form.agent_name?.trim()      || null,
      agent_mobile:   this.form.agent_mobile?.trim()    || null,
      agent_whatsapp: this.form.agent_whatsapp?.trim()  || null,
      agent_email:    this.form.agent_email?.trim()     || null,
      agent_picture:  this.form.agent_picture?.trim()   || null,
      views_count:    0,
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
