import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdStudioService } from '../../../core/services/ad-studio.service';
import { AdminAiAd } from '../../../core/models/admin-ai-ad.model';

/** The AI ads admins made in the app: three variations each, with the facts every one quotes. Created and downloaded in the app. */
@Component({
  selector: 'app-admin-ai-ads',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-ai-ads.html',
  styleUrl: './admin-ai-ads.scss',
})
export class AdminAiAdsComponent implements OnInit {
  ads: AdminAiAd[] = [];
  isLoading = false;
  failed = false;

  constructor(private service: AdStudioService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.failed = false;
    this.service.list().subscribe({
      next: (res) => { this.ads = res.data; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.isLoading = false; this.failed = true; this.cdr.detectChanges(); },
    });
  }

  size(a: AdminAiAd): string {
    return a.brief?.width && a.brief?.height ? `${a.brief.width} × ${a.brief.height} px` : '';
  }

  remove(a: AdminAiAd): void {
    if (!confirm(`Delete "${a.title}"?`)) return;
    this.service.remove(a.id).subscribe({
      next: () => { this.ads = this.ads.filter((x) => x.id !== a.id); this.cdr.detectChanges(); },
      error: () => {},
    });
  }
}
