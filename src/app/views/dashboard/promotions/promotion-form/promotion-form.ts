import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompoundService } from '../../../../core/services/compound.service';
import { PromotionService } from '../../../../core/services/promotion.service';
import { PropertyService } from '../../../../core/services/property.service';
import { Property } from '../../../../core/models/property.model';
import { Compound } from '../../../../core/models/compound.model';
import { CreatePromotionDto } from '../../../../core/models/promotion.model';
import { MediaUploaderComponent } from '../../../../shared/components/media-uploader/media-uploader';

/**
 * New or existing launch/offer. Pre-selects the compound when opened from a compound page (?compound=ID).
 * Besides the card, the admin chooses which of the compound's PRIMARY units it is about, or creates a new one on the spot.
 */
@Component({
  selector: 'app-promotion-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUploaderComponent],
  templateUrl: './promotion-form.html',
  styleUrl: './promotion-form.scss',
})
export class PromotionFormComponent implements OnInit {
  compounds: Compound[] = [];
  form: CreatePromotionDto = {
    compound_id: null, type: 'launch', title_ar: '', title_en: '', sub_ar: '', sub_en: '',
    image: '', video_url: '', video_duration: null, starts_at: '', ends_at: '', is_active: true, sort_order: 0,
  };
  isSubmitting = false;
  errorMessage = '';

  /** Editing an existing promotion (the compound is then fixed). */
  editId: number | null = null;

  // the compound's primary units, and which of them this promotion points at
  units: Property[] = [];
  selectedIds = new Set<number>();
  unitQuery = '';
  loadingUnits = false;

  // creating a new primary unit without leaving the page
  showNew = false;
  creatingUnit = false;
  newUnitError = '';
  newUnit = { title: '', property_type: 'chalet', bedrooms: null as number | null, bathrooms: null as number | null, size: null as number | null, price: null as number | null };
  readonly unitTypes = ['chalet', 'villa', 'apartment', 'townhouse', 'twinhouse', 'duplex', 'studio', 'marina_apartment', 'shop', 'office', 'clinic', 'land'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private compoundService: CompoundService,
    private promotionService: PromotionService,
    private propertyService: PropertyService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const pre = Number(this.route.snapshot.queryParamMap.get('compound'));
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.editId = id || null;
    this.compoundService.getAll(true).subscribe({
      next: (res) => {
        this.compounds = res.data;
        if (this.editId) {
          this.loadExisting(this.editId);
        } else if (pre && res.data.some((c) => c.id === pre)) {
          this.form.compound_id = pre;
          this.prefill(pre);
          this.loadUnits();
        }
        this.cdr.detectChanges();
      },
    });
  }

  private loadExisting(id: number): void {
    this.promotionService.getById(id).subscribe({
      next: (res) => {
        const p = res.data;
        const local = (v: string | null) => (v ? new Date(v).toISOString().slice(0, 16) : '');
        this.form = {
          compound_id: p.compound_id, type: p.type,
          title_ar: p.title_ar || '', title_en: p.title_en || '', sub_ar: p.sub_ar || '', sub_en: p.sub_en || '',
          image: p.image || '', video_url: p.video_url || '', video_duration: p.video_duration,
          starts_at: local(p.starts_at), ends_at: local(p.ends_at), is_active: p.is_active, sort_order: p.sort_order,
        };
        this.selectedIds = new Set(p.property_ids || []);
        this.loadUnits();
        this.cdr.detectChanges();
      },
      error: () => { this.errorMessage = 'Could not load this promotion.'; this.cdr.detectChanges(); },
    });
  }

  /** The compound changed: its primary units are the pool to choose from. */
  onCompound(id: number | null): void {
    this.prefill(id);
    this.selectedIds = new Set();
    this.units = [];
    this.loadUnits();
  }

  loadUnits(): void {
    if (!this.form.compound_id) return;
    this.loadingUnits = true;
    this.propertyService.getAll({ compound_id: this.form.compound_id, listing_type: 'primary', limit: 100 }).subscribe({
      next: (res) => { this.units = res.data; this.loadingUnits = false; this.cdr.detectChanges(); },
      error: () => { this.loadingUnits = false; this.cdr.detectChanges(); },
    });
  }

  get shownUnits(): Property[] {
    const q = this.unitQuery.trim().toLowerCase();
    return q ? this.units.filter((u) => `${u.title_en || ''} ${u.title_ar || ''} ${u.reference_code || ''}`.toLowerCase().includes(q)) : this.units;
  }

  toggleUnit(id: number): void {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
  }

  selectAllShown(): void { this.shownUnits.forEach((u) => this.selectedIds.add(u.id)); }
  clearUnits(): void { this.selectedIds.clear(); }

  /** Creates a primary unit in this compound and ticks it. More details can be added later in Properties. */
  createUnit(): void {
    const t = this.newUnit;
    if (!this.form.compound_id) { this.newUnitError = 'Choose the compound first.'; return; }
    if (!t.title.trim() || !t.price || !t.size) { this.newUnitError = 'A title, price and size are required.'; return; }
    const arabic = /[\u0600-\u06FF]/.test(t.title);
    this.creatingUnit = true;
    this.newUnitError = '';
    // one language is enough: the server translates the other side
    this.propertyService.create({
      [arabic ? 'title_ar' : 'title_en']: t.title.trim(),
      property_type: t.property_type, property_status: 'for_sale', listing_type: 'primary',
      compound_id: this.form.compound_id, country: 'egypt',
      price: Number(t.price), size: Number(t.size),
      bedrooms: t.bedrooms, bathrooms: t.bathrooms,
      images: [], is_featured: false, is_active: true, slug: '',
    } as never).subscribe({
      next: (res) => {
        this.creatingUnit = false;
        this.units = [res.data, ...this.units];
        this.selectedIds.add(res.data.id);
        this.newUnit = { title: '', property_type: t.property_type, bedrooms: null, bathrooms: null, size: null, price: null };
        this.showNew = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.creatingUnit = false;
        this.newUnitError = err.error?.message || 'Could not create the unit.';
        this.cdr.detectChanges();
      },
    });
  }

  get selected(): Compound | undefined {
    return this.compounds.find((c) => c.id === this.form.compound_id);
  }

  /** Start from the compound’s own name and cover so a launch is one click away. */
  prefill(id: number | null): void {
    const c = this.compounds.find((x) => x.id === id);
    if (!c) return;
    if (!this.form.title_en && !this.form.title_ar) {
      this.form.title_en = c.name_en || '';
      this.form.title_ar = c.name_ar || '';
    }
    if (!this.form.image && c.main_image) this.form.image = c.main_image;
  }

  onImage(urls: string[]): void { if (urls.length) this.form.image = urls[0]; }
  onVideo(urls: string[]): void { if (urls.length) this.form.video_url = urls[0]; }

  submit(): void {
    if (!this.form.compound_id) { this.errorMessage = 'Choose the compound.'; return; }
    if (!this.form.title_en.trim() && !this.form.title_ar.trim()) { this.errorMessage = 'A title is required.'; return; }
    if (!this.form.image.trim()) { this.errorMessage = 'An image is required (it is also the poster for a video).'; return; }

    const blank = (v: string) => (v && v.trim() ? v.trim() : null);
    const payload: Record<string, unknown> = {
      compound_id: this.form.compound_id,
      type: this.form.type,
      title_ar: blank(this.form.title_ar), title_en: blank(this.form.title_en),
      sub_ar: blank(this.form.sub_ar), sub_en: blank(this.form.sub_en),
      image: this.form.image.trim(),
      video_url: blank(this.form.video_url),
      video_duration: this.form.video_url ? this.form.video_duration : null,
      starts_at: this.form.starts_at ? new Date(this.form.starts_at).toISOString() : undefined,
      ends_at: this.form.ends_at ? new Date(this.form.ends_at).toISOString() : undefined,
      is_active: this.form.is_active,
      sort_order: Number(this.form.sort_order) || 0,
      // the primary units this launch/offer is about (none = the whole compound)
      property_ids: [...this.selectedIds],
    };

    this.isSubmitting = true;
    this.errorMessage = '';
    if (this.editId) delete payload['compound_id']; // a promotion does not move between compounds
    const save = this.editId ? this.promotionService.update(this.editId, payload) : this.promotionService.create(payload);
    save.subscribe({
      next: () => { this.isSubmitting = false; this.router.navigate(['/dashboard/promotions']); },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to save the promotion.';
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void { this.router.navigate(['/dashboard/promotions']); }
}
