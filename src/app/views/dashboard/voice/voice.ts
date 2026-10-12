import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoiceService } from '../../../core/services/voice.service';
import { VoiceMessage, Pagination } from '../../../core/models/voice.model';

@Component({
  selector: 'app-voice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './voice.html',
  styleUrl: './voice.scss',
})
export class VoiceComponent implements OnInit {
  messages:   VoiceMessage[] = [];
  pagination: Pagination | null = null;
  isLoading   = false;
  page        = 1;
  limit       = 20;

  // Filters
  status = '';

  constructor(
    private voiceService: VoiceService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.voiceService.getMessages(this.page, this.limit, { status: this.status || undefined }).subscribe({
      next: (res) => {
        this.messages   = res.data;
        this.pagination = res.pagination;
        this.isLoading  = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.load();
  }

  clearFilters(): void {
    this.status = '';
    this.page   = 1;
    this.load();
  }

  get hasActiveFilters(): boolean {
    return !!this.status;
  }

  goToPage(p: number): void {
    if (!this.pagination) return;
    if (p < 1 || p > this.pagination.pages || p === this.page) return;
    this.page = p;
    this.load();
  }

  get pageNumbers(): number[] {
    if (!this.pagination) return [];
    const total = this.pagination.pages;
    const cur   = this.page;
    const pages: number[] = [];
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || Math.abs(i - cur) <= 2) pages.push(i);
    }
    return pages;
  }

  get rangeEnd(): number {
    if (!this.pagination) return 0;
    return Math.min(this.page * this.limit, this.pagination.total);
  }

  initials(name: string | undefined): string {
    return name?.charAt(0)?.toUpperCase() || '?';
  }

  languageLabel(lang: 'ar' | 'en' | null): string {
    return lang === 'ar' ? 'Arabic' : lang === 'en' ? 'English' : '—';
  }

  // Flags a recording where the spoken language doesn't match the app's UI
  // locale at the time — useful to the team when chasing TTS language bugs.
  languageMismatch(m: VoiceMessage): boolean {
    return !!m.requested_language && !!m.detected_language && m.requested_language !== m.detected_language;
  }

  formatDuration(seconds: number | null): string {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
