import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PHASE_STATUS_LABELS, Phase } from '../../../core/models/phase.model';
import { PhaseService } from '../../../core/services/phase.service';

interface PhaseDraft {
  id?: number;
  name_ar: string; name_en: string;
  delivery_label_ar: string; delivery_label_en: string;
  sort_order: number | null;
  is_active: boolean;
  notify: boolean;
}

/** Phases of one compound (Marina Rise, Bayside …). Availability and status come from the units. */
@Component({
  selector: 'app-phases-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './phases-manager.html',
  styleUrl: './phases-manager.scss',
})
export class PhasesManagerComponent implements OnInit {
  @Input({ required: true }) compoundId!: number;

  phases: Phase[] = [];
  draft: PhaseDraft | null = null;
  saving = false;
  error = '';
  readonly statusLabels = PHASE_STATUS_LABELS;

  constructor(private phaseService: PhaseService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.phaseService.getForCompound(this.compoundId).subscribe({
      next: (res) => { this.phases = res.data; this.cdr.detectChanges(); },
      error: () => { this.error = 'Could not load phases.'; this.cdr.detectChanges(); },
    });
  }

  add(): void {
    this.error = '';
    this.draft = {
      name_ar: '', name_en: '', delivery_label_ar: '', delivery_label_en: '',
      sort_order: this.phases.length + 1, is_active: true, notify: true,
    };
  }

  edit(p: Phase): void {
    this.error = '';
    this.draft = {
      id: p.id, name_ar: p.name_ar, name_en: p.name_en ?? '',
      delivery_label_ar: p.delivery_label_ar ?? '', delivery_label_en: p.delivery_label_en ?? '',
      sort_order: p.sort_order, is_active: p.is_active, notify: false,
    };
  }

  cancel(): void { this.draft = null; this.error = ''; }

  save(): void {
    const d = this.draft;
    if (!d) return;
    if (!d.name_ar.trim()) { this.error = 'Arabic name is required.'; return; }
    this.saving = true; this.error = '';
    const body: Record<string, unknown> = {
      name_ar: d.name_ar.trim(), name_en: d.name_en.trim() || null,
      delivery_label_ar: d.delivery_label_ar.trim() || null,
      delivery_label_en: d.delivery_label_en.trim() || null,
      sort_order: d.sort_order ?? 0, is_active: d.is_active,
    };
    const req = d.id
      ? this.phaseService.update(d.id, body)
      : this.phaseService.create({ ...body, compound_id: this.compoundId, notify: d.notify });
    req.subscribe({
      next: () => { this.saving = false; this.draft = null; this.load(); },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Failed to save the phase.';
        this.cdr.detectChanges();
      },
    });
  }

  remove(p: Phase): void {
    if (!confirm(`Delete phase “${p.name_en || p.name_ar}”? Its units stay on the compound.`)) return;
    this.phaseService.remove(p.id).subscribe({
      next: () => this.load(),
      error: (err) => { this.error = err.error?.message || 'Failed to delete the phase.'; this.cdr.detectChanges(); },
    });
  }
}
