import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PropertyService } from '../../../../core/services/property.service';
import { PhaseService } from '../../../../core/services/phase.service';
import { Phase } from '../../../../core/models/phase.model';
import { CompoundService } from '../../../../core/services/compound.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { UnitDetailsFieldsComponent } from '../../../../shared/components/unit-details-fields/unit-details-fields';
import { ListingAttributesFieldsComponent } from '../../../../shared/components/listing-attributes-fields/listing-attributes-fields';
import { CreatePropertyDto, PropertyType, PropertyStatus, ListingType, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, LISTING_TYPE_LABELS } from '../../../../core/models/property.model';
import { Compound } from '../../../../core/models/compound.model';
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
  imports: [CommonModule, FormsModule, MediaUploaderComponent, ListingAttributesFieldsComponent, UnitDetailsFieldsComponent],
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

  readonly listingTypes: { value: ListingType; en: string; ar: string }[] =
    (Object.keys(LISTING_TYPE_LABELS) as ListingType[]).map(key => ({
      value: key, ...LISTING_TYPE_LABELS[key],
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

  // ── Compounds for dropdown ─────────────────────────────────
  compounds: Compound[] = [];

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
    listing_type:    'primary',
    price:           0,
    size:            null,
    bedrooms:        null,
    bathrooms:       null,
    country:         'egypt',
    state:           'cairo',
    compound_id:      null,
    phase_id:         null,
    delivery_date:    null,
    finishing:        null,
    payment_options:  null,
    down_payment_percent: null,
    installment_years:    null,
    features:         null,
    garden_size:      null,
    level_ar:         '',
    level_en:         '',
    floor_plan:       '',
    maintenance_ar:   '',
    maintenance_en:   '',
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
    titleToEn: false,
    titleToAr: false,
    descToEn:  false,
    descToAr:  false,
  };

  translateErrors = {
    titleToEn: false,
    titleToAr: false,
    descToEn:  false,
    descToAr:  false,
  };

  constructor(
    private propertyService:   PropertyService,
    private compoundService:    CompoundService,
    private phaseService:       PhaseService,
    private translationService: TranslationService,
    private router:            Router,
    private cdr:               ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCompounds();
  }


  phases: Phase[] = [];

  /** Phases of the chosen compound; a unit can sit in one of them. */
  loadPhases(compoundId: number | null | undefined, keep = true): void {
    if (!compoundId) { this.phases = []; return; }
    this.phaseService.getForCompound(compoundId).subscribe({
      next: (res) => {
        this.phases = res.data;
        if (!keep) this.form.phase_id = null;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  onCompoundChange(): void { this.loadPhases(this.form.compound_id, false); }

  loadCompounds(): void {
    this.compoundService.getAll().subscribe({
      next: (res) => { this.compounds = res.data; this.cdr.detectChanges(); },
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
    this.translateErrors.titleToEn = false;
    this.translationService.translate(this.form.title_ar, 'ar', 'en').subscribe(result => {
      if (result !== null) this.form.title_en = result;
      else this.translateErrors.titleToEn = true;
      this.translating.titleToEn = false;
      this.cdr.detectChanges();
    });
  }

  translateTitleToAr(): void {
    if (!this.form.title_en?.trim() || this.translating.titleToAr) return;
    this.translating.titleToAr = true;
    this.translateErrors.titleToAr = false;
    this.translationService.translate(this.form.title_en, 'en', 'ar').subscribe(result => {
      if (result !== null) this.form.title_ar = result;
      else this.translateErrors.titleToAr = true;
      this.translating.titleToAr = false;
      this.cdr.detectChanges();
    });
  }

  translateDescToEn(): void {
    if (!this.form.content_ar?.trim() || this.translating.descToEn) return;
    this.translating.descToEn = true;
    this.translateErrors.descToEn = false;
    this.translationService.translate(this.form.content_ar, 'ar', 'en').subscribe(result => {
      if (result !== null) this.form.content_en = result;
      else this.translateErrors.descToEn = true;
      this.translating.descToEn = false;
      this.cdr.detectChanges();
    });
  }

  translateDescToAr(): void {
    if (!this.form.content_en?.trim() || this.translating.descToAr) return;
    this.translating.descToAr = true;
    this.translateErrors.descToAr = false;
    this.translationService.translate(this.form.content_en, 'en', 'ar').subscribe(result => {
      if (result !== null) this.form.content_ar = result;
      else this.translateErrors.descToAr = true;
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
      if (!this.form.compound_id) {
        this.stepErrors[0] = 'Choose the compound this property belongs to.';
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
      garden_size:    this.form.garden_size === null || this.form.garden_size === ('' as any) ? null : Number(this.form.garden_size),
      level_ar:       this.form.level_ar?.trim()        || null,
      level_en:       this.form.level_en?.trim()        || null,
      floor_plan:     this.form.floor_plan?.trim()      || null,
      maintenance_ar: this.form.maintenance_ar?.trim()  || null,
      maintenance_en: this.form.maintenance_en?.trim()  || null,
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
