import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompoundService } from '../../../../core/services/compound.service';
import { Compound, CreateCompoundDto, CompoundFeature } from '../../../../core/models/compound.model';
import { PropertyService } from '../../../../core/services/property.service';
import { Property } from '../../../../core/models/property.model';
import { DeveloperService } from '../../../../core/services/developer.service';
import { Developer } from '../../../../core/models/developer.model';
import { TranslationService } from '../../../../core/services/translation.service';
import { AMENITIES, FINISHINGS, PAYMENT_OPTIONS } from '../../../../core/models/listing-options';
import { AreaService } from '../../../../core/services/area.service';
import { Area } from '../../../../core/models/area.model';
import { promotionStatus } from '../../../../core/models/promotion.model';
import { PromotionService } from '../../../../core/services/promotion.service';
import { Promotion } from '../../../../core/models/promotion.model';
import { CompoundProfileFieldsComponent } from '../../../../shared/components/compound-profile-fields/compound-profile-fields';
import { PhasesManagerComponent } from '../../../../shared/components/phases-manager/phases-manager';
import { ListingAttributesFieldsComponent } from '../../../../shared/components/listing-attributes-fields/listing-attributes-fields';

@Component({
  selector: 'app-compound-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ListingAttributesFieldsComponent, CompoundProfileFieldsComponent, PhasesManagerComponent],
  templateUrl: './compound-detail.html',
  styleUrl: './compound-detail.scss',
})
export class CompoundDetailComponent implements OnInit {
  compound: Compound | null = null;
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

  developers: Developer[] = [];

  areas: Area[] = [];
  promotions: Promotion[] = [];   // this compound's launches & offers, newest first

  readonly promotionStatus = promotionStatus;

  finishingLabel(v: string | null): string {
    return FINISHINGS.find((f) => f.value === v)?.label ?? '—';
  }
  paymentLabels(v: string[] | null): string {
    return v?.length ? v.map((x) => PAYMENT_OPTIONS.find((p) => p.value === x)?.label ?? x).join(', ') : '—';
  }
  amenityLabels(v: string[] | null): string {
    return v?.length ? v.map((x) => AMENITIES.find((a) => a.value === x)?.label ?? x).join(', ') : '—';
  }

  endPromotion(p: Promotion): void {
    this.promotionService.end(p.id).subscribe({
      next: () => { this.loadPromotions(); },
      error: (err) => { this.errorMessage = err.error?.message || 'Failed to end the promotion.'; this.cdr.detectChanges(); },
    });
  }

  private loadPromotions(): void {
    if (!this.compound) return;
    this.promotionService.getAll({ all: true, compoundId: this.compound.id }).subscribe({
      next: (res) => { this.promotions = res.data; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  addPromotion(): void {
    this.router.navigate(['/dashboard/promotions/new'], { queryParams: { compound: this.compound!.id } });
  }

  editForm: CreateCompoundDto = {
    developer_id: null, area_id: null, delivery_date: null, finishing: null, payment_options: null,
    down_payment_percent: null, installment_years: null, amenities: null,
    facilities_ar: null, facilities_en: null, facts: null, delivered_since: null,
    name_ar: '', name_en: '', desc_ar: '', desc_en: '',
    main_image: null, gallery: [], features: [], is_active: true,
  };

  galleryInput = '';

  // Feature builder — shared between "add new" and "edit existing"
  newFeature: CompoundFeature = this.emptyFeature();
  featureImageInput    = '';
  showFeatureForm      = false;
  editingFeatureIndex: number | null = null;

  translating = {
    nameToEn: false, nameToAr: false,
    descToEn: false, descToAr: false,
    featTitleToEn: false, featTitleToAr: false,
    featSubtitleToEn: false, featSubtitleToAr: false,
  };

  translateErrors = {
    nameToEn: false, nameToAr: false,
    descToEn: false, descToAr: false,
    featTitleToEn: false, featTitleToAr: false,
    featSubtitleToEn: false, featSubtitleToAr: false,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private compoundService: CompoundService,
    private propertyService: PropertyService,
    private developerService: DeveloperService,
    private areaService: AreaService,
    private promotionService: PromotionService,
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCompound(id);
  }

  private emptyFeature(): CompoundFeature {
    return { title_ar: '', title_en: '', subtitle_ar: '', subtitle_en: '', images: [] };
  }

  private resetTranslateErrors(): void {
    Object.keys(this.translateErrors).forEach(k => (this.translateErrors as any)[k] = false);
  }

  loadCompound(id: number): void {
    this.isLoading = true;
    this.compoundService.getById(id).subscribe({
      next: (res) => {
        this.compound   = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
        this.loadProperties(id);
        this.loadPromotions();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard/compounds']);
      },
    });
  }

  // ── Properties ─────────────────────────────────────────────
  loadProperties(compoundId: number): void {
    this.propsLoading = true;
    this.propertyService.getAll({
      compound_id: compoundId,
      page:       this.propsPage,
      limit:      this.propsLimit,
    }).subscribe({
      next: (res) => {
        this.properties      = res.data;
        this.propsTotal      = res.pagination?.total ?? res.total ?? res.data.length;
        this.propsTotalPages = this.propsTotal > 0 ? Math.ceil(this.propsTotal / Number(this.propsLimit)) : 1;
        this.buildPropsPageNumbers();
        this.propsLoading    = false;
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
      if (i === 1 || i === total || (i >= cur - delta && i <= cur + delta)) pages.push(i);
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
    this.loadProperties(this.compound!.id);
  }

  propsOnPageSizeChange(): void {
    this.propsPage = 1;
    this.loadProperties(this.compound!.id);
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

  loadDevelopers(): void {
    this.developerService.getAll(true).subscribe({
      next: (res) => { this.developers = res.data; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  goToDeveloper(): void {
    if (this.compound?.developer_id) {
      this.router.navigate(['/dashboard/developers', this.compound.developer_id]);
    }
  }

  enableEdit(): void {
    if (!this.compound) return;
    this.loadDevelopers();
    this.areaService.getAll().subscribe({
      next: (res) => { this.areas = res.data.filter((a) => a.is_active); this.cdr.detectChanges(); },
      error: () => {},
    });
    this.editForm = {
      developer_id:  this.compound.developer_id,
      area_id:       this.compound.area_id,
      delivery_date: this.compound.delivery_date,
      finishing:     this.compound.finishing,
      payment_options: this.compound.payment_options,
      down_payment_percent: this.compound.down_payment_percent == null ? null : Number(this.compound.down_payment_percent),
      installment_years:    this.compound.installment_years,
      amenities:     this.compound.amenities,
      facilities_ar: this.compound.facilities_ar ?? null,
      facilities_en: this.compound.facilities_en ?? null,
      facts:         this.compound.facts ?? null,
      delivered_since: this.compound.delivered_since ?? null,
      name_ar:    this.compound.name_ar,
      name_en:    this.compound.name_en,
      desc_ar:    this.compound.desc_ar ?? '',
      desc_en:    this.compound.desc_en ?? '',
      main_image: this.compound.main_image,
      gallery:    [...this.compound.gallery],
      features:   this.compound.features.map(f => ({ ...f, images: [...f.images] })),
      is_active:  this.compound.is_active,
    };
    this.errorMessage        = '';
    this.showFeatureForm     = false;
    this.editingFeatureIndex = null;
    this.isEditMode          = true;
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.isEditMode          = false;
    this.errorMessage        = '';
    this.showFeatureForm     = false;
    this.editingFeatureIndex = null;
    this.galleryInput        = '';
  }

  // ── Name translation ───────────────────────────────────────
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
    this.translationService.translate(this.editForm.name_en, 'en', 'ar').subscribe(r => {
      if (r !== null) this.editForm.name_ar = r; else this.translateErrors.nameToAr = true;
      this.translating.nameToAr = false; this.cdr.detectChanges();
    });
  }

  // ── Description translation ────────────────────────────────
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

  // ── Feature title translation ──────────────────────────────
  translateFeatTitleToEn(): void {
    if (!this.newFeature.title_ar?.trim() || this.translating.featTitleToEn) return;
    this.translating.featTitleToEn = true; this.translateErrors.featTitleToEn = false;
    this.translationService.translate(this.newFeature.title_ar, 'ar', 'en').subscribe(r => {
      if (r !== null) this.newFeature.title_en = r; else this.translateErrors.featTitleToEn = true;
      this.translating.featTitleToEn = false; this.cdr.detectChanges();
    });
  }

  translateFeatTitleToAr(): void {
    if (!this.newFeature.title_en?.trim() || this.translating.featTitleToAr) return;
    this.translating.featTitleToAr = true; this.translateErrors.featTitleToAr = false;
    this.translationService.translate(this.newFeature.title_en, 'en', 'ar').subscribe(r => {
      if (r !== null) this.newFeature.title_ar = r; else this.translateErrors.featTitleToAr = true;
      this.translating.featTitleToAr = false; this.cdr.detectChanges();
    });
  }

  // ── Feature subtitle translation ───────────────────────────
  translateFeatSubtitleToEn(): void {
    if (!this.newFeature.subtitle_ar?.trim() || this.translating.featSubtitleToEn) return;
    this.translating.featSubtitleToEn = true; this.translateErrors.featSubtitleToEn = false;
    this.translationService.translate(this.newFeature.subtitle_ar, 'ar', 'en').subscribe(r => {
      if (r !== null) this.newFeature.subtitle_en = r; else this.translateErrors.featSubtitleToEn = true;
      this.translating.featSubtitleToEn = false; this.cdr.detectChanges();
    });
  }

  translateFeatSubtitleToAr(): void {
    if (!this.newFeature.subtitle_en?.trim() || this.translating.featSubtitleToAr) return;
    this.translating.featSubtitleToAr = true; this.translateErrors.featSubtitleToAr = false;
    this.translationService.translate(this.newFeature.subtitle_en, 'en', 'ar').subscribe(r => {
      if (r !== null) this.newFeature.subtitle_ar = r; else this.translateErrors.featSubtitleToAr = true;
      this.translating.featSubtitleToAr = false; this.cdr.detectChanges();
    });
  }

  // ── Gallery ────────────────────────────────────────────────
  addGalleryImage(): void {
    const val = this.galleryInput.trim();
    if (!val) return;
    this.editForm.gallery.push(val);
    this.galleryInput = '';
  }

  removeGalleryImage(index: number): void { this.editForm.gallery.splice(index, 1); }

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

  removeFeatureImage(index: number): void { this.newFeature.images.splice(index, 1); }

  onFeatureImageKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addFeatureImage(); }
  }

  // ── Feature CRUD ───────────────────────────────────────────
  openFeatureForm(): void {
    this.newFeature          = this.emptyFeature();
    this.featureImageInput   = '';
    this.editingFeatureIndex = null;
    this.showFeatureForm     = true;
    this.resetTranslateErrors();
  }

  cancelFeature(): void { this.showFeatureForm = false; }

  addFeature(): void {
    if (!this.newFeature.title_ar && !this.newFeature.title_en) return;
    this.editForm.features.push({ ...this.newFeature, images: [...this.newFeature.images] });
    this.showFeatureForm   = false;
    this.featureImageInput = '';
  }

  removeFeature(index: number): void { this.editForm.features.splice(index, 1); }

  startEditFeature(i: number): void {
    const f = this.editForm.features[i];
    this.newFeature          = { ...f, images: [...f.images] };
    this.editingFeatureIndex = i;
    this.showFeatureForm     = false;
    this.featureImageInput   = '';
    this.resetTranslateErrors();
  }

  cancelEditFeature(): void {
    this.editingFeatureIndex = null;
    this.featureImageInput   = '';
  }

  saveEditFeature(): void {
    if (this.editingFeatureIndex === null) return;
    this.editForm.features[this.editingFeatureIndex] = { ...this.newFeature, images: [...this.newFeature.images] };
    this.editingFeatureIndex = null;
    this.featureImageInput   = '';
  }

  // ── Save ───────────────────────────────────────────────────
  saveEdit(): void {
    if (!this.editForm.name_ar.trim()) {
      this.errorMessage = 'Arabic name is required.';
      return;
    }
    if (!this.editForm.developer_id) {
      this.errorMessage = 'Pick the developer this compound belongs to.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    this.compoundService.update(this.compound!.id, this.editForm).subscribe({
      next: (res) => {
        this.compound        = res.data;
        this.isSubmitting   = false;
        this.isEditMode     = false;
        this.successMessage = 'Compound updated successfully!';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to update compound.';
        this.cdr.detectChanges();
      },
    });
  }

  // ── Delete ─────────────────────────────────────────────────
  confirmDelete(): void  { this.showDeleteModal = true; }
  cancelDelete(): void   { this.showDeleteModal = false; }

  deleteCompound(): void {
    this.isDeleting = true;
    this.compoundService.remove(this.compound!.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.router.navigate(['/dashboard/compounds']);
      },
      error: () => {
        this.isDeleting      = false;
        this.showDeleteModal = false;
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void { this.router.navigate(['/dashboard/compounds']); }
}
