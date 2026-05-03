import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChatService } from '../../../../core/services/chat.service';
import { ChatMessage, ChatSession, Pagination } from '../../../../core/models/chat.model';

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-detail.html',
  styleUrl: './chat-detail.scss',
})
export class ChatDetailComponent implements OnInit {
  sessionId:  number = 0;
  session:    ChatSession | null = null;  // kept for future — currently loaded from list
  messages:   ChatMessage[] = [];
  pagination: Pagination | null = null;
  isLoading   = false;
  isLoadingMore = false;
  page        = 1;
  limit       = 30;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.sessionId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadMessages(true);
  }

  loadMessages(initial = false): void {
    if (initial) { this.isLoading = true; this.messages = []; this.page = 1; }
    else           this.isLoadingMore = true;

    this.chatService.getMessages(this.sessionId, this.page, this.limit).subscribe({
      next: (res) => {
        // API returns newest-first — reverse to show chronologically oldest→newest
        const incoming = [...res.data].reverse();
        // Prepend older messages before existing ones
        this.messages   = [...incoming, ...this.messages];
        this.pagination = res.pagination;
        this.isLoading  = this.isLoadingMore = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = this.isLoadingMore = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadOlder(): void {
    if (!this.pagination || this.page >= this.pagination.pages) return;
    this.page++;
    this.loadMessages(false);
  }

  get hasOlderMessages(): boolean {
    return !!this.pagination && this.page < this.pagination.pages;
  }

  /** Convert basic markdown to safe HTML for display */
  renderContent(text: string | null): SafeHtml {
    if (!text) return this.sanitizer.bypassSecurityTrustHtml('');
    const html = text
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,     '<em>$1</em>')
      .replace(/\n/g,            '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  isUserMessage(msg: ChatMessage): boolean {
    return msg.role === 'user';
  }

  isAssistantMessage(msg: ChatMessage): boolean {
    return msg.role === 'assistant';
  }

  goBack(): void {
    this.router.navigate(['/dashboard/chat']);
  }
}
