import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeveloperService } from '../../../core/services/developer.service';
import { ProjectService } from '../../../core/services/project.service';
import { Developer } from '../../../core/models/developer.model';
import { Project } from '../../../core/models/project.model';

/**
 * "About a compound / developer" for a news article.
 * The link is what powers the app: followers get notified, and the article becomes the
 * "latest update" line on their Saved cards.
 */
@Component({
  selector: 'app-news-link-fields',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="nlf">
      <div class="form-row">
        <div class="form-group">
          <label>Compound (optional)</label>
          <select [(ngModel)]="form.project_id" name="project_id">
            <option [ngValue]="null">— none —</option>
            <option *ngFor="let p of projects" [ngValue]="p.id">{{ p.name_en || p.name_ar }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Developer (optional)</label>
          <select [(ngModel)]="form.developer_id" name="developer_id">
            <option [ngValue]="null">— none —</option>
            <option *ngFor="let d of developers" [ngValue]="d.id">{{ d.name_en || d.name_ar }}</option>
          </select>
        </div>
      </div>
      <p class="hint">
        Linked articles notify people who follow that compound or developer, and show as their
        “latest update” in Saved. Leave empty for general market news.
      </p>
    </div>
  `,
  styles: [`
    :host { display: block; }
    select {
      padding: 0.7rem 0.9rem; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem;
      color: #1a1f2e; width: 100%; box-sizing: border-box; background: #fff; font-family: inherit; outline: none;
      &:focus { border-color: #1e3a6e; box-shadow: 0 0 0 3px #e8ecf5; }
    }
    .hint { margin: 0.25rem 0 0; font-size: 0.8rem; color: #6b7280; line-height: 1.45; }
  `],
})
export class NewsLinkFieldsComponent implements OnInit {
  @Input({ required: true }) form!: { project_id: number | null; developer_id: number | null };

  projects: Project[] = [];
  developers: Developer[] = [];

  constructor(
    private projectService: ProjectService,
    private developerService: DeveloperService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.projectService.getAll(true).subscribe({
      next: (res) => { this.projects = res.data; this.cdr.detectChanges(); },
      error: () => {},
    });
    this.developerService.getAll(true).subscribe({
      next: (res) => { this.developers = res.data; this.cdr.detectChanges(); },
      error: () => {},
    });
  }
}
