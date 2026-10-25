import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VoiceService, VoiceRecording } from '../../../core/services/voice.service';
import { Pagination } from '../../../core/models/chat.model';

@Component({
  selector: 'app-voice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './voice.html',
  styleUrls: ['../chat/chat.scss', './voice.scss'],
})
export class VoiceComponent implements OnInit {
  rows: VoiceRecording[] = [];
  pagination: Pagination | null = null;
  isLoading = false;
  page = 1;
  limit = 20;

  q = '';
  from = '';
  to = '';
  status = '';

  constructor(private voice: VoiceService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.voice.list(this.page, this.limit, { q: this.q, from: this.from, to: this.to, status: this.status }).subscribe({
      next: (res) => {
        this.rows = res.data;
        this.pagination = res.pagination;
        this.isLoading = false;
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
    this.q = this.from = this.to = this.status = '';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!(this.q || this.from || this.to || this.status);
  }

  /** The text the user finally sent; falls back to what was heard. */
  said(r: VoiceRecording): string {
    return r.final_text || r.transcript || '';
  }

  edited(r: VoiceRecording): boolean {
    return !!r.final_text && !!r.transcript && r.final_text.trim() !== r.transcript.trim();
  }

  duration(s: number | null): string {
    if (s == null) return '—';
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  openChat(r: VoiceRecording): void {
    if (r.chat_session_id) this.router.navigate(['/dashboard/chat', r.chat_session_id]);
  }

  remove(r: VoiceRecording): void {
    if (!confirm('Delete this recording? The audio is removed permanently.')) return;
    this.voice.remove(r.id).subscribe({ next: () => this.load() });
  }

  goToPage(p: number): void {
    if (!this.pagination || p < 1 || p > this.pagination.pages || p === this.page) return;
    this.page = p;
    this.load();
  }

  get rangeEnd(): number {
    return this.pagination ? Math.min(this.page * this.limit, this.pagination.total) : 0;
  }

  initials(name: string | undefined): string {
    return name?.charAt(0)?.toUpperCase() || '?';
  }
}
