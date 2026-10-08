import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompoundService } from '../../../../core/services/compound.service';
import { PromotionService } from '../../../../core/services/promotion.service';
import { Compound } from '../../../../core/models/compound.model';
import { CreatePromotionDto } from '../../../../core/models/promotion.model';
import { MediaUploaderComponent } from '../../../../shared/components/media-uploader/media-uploader';

/** New launch or offer. Pre-selects the compound when opened from a compound page (?compound=ID). */
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private compoundService: CompoundService,
    private promotionService: PromotionService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const pre = Number(this.route.snapshot.queryParamMap.get('compound'));
    this.compoundService.getAll(true).subscribe({
      next: (res) => {
        this.compounds = res.data;
        if (pre && res.data.some((c) => c.id === pre)) {
          this.form.compound_id = pre;
          this.prefill(pre);
        }
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
    };

    this.isSubmitting = true;
    this.errorMessage = '';
    this.promotionService.create(payload).subscribe({
      next: () => { this.isSubmitting = false; this.router.navigate(['/dashboard/promotions']); },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to create the promotion.';
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void { this.router.navigate(['/dashboard/promotions']); }
}
