import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Developer } from '../../../core/models/developer.model';
import { PROJECT_STATES, CreateProjectDto } from '../../../core/models/project.model';

/** Developer, location and "new launch" fields shared by the project form and the edit mode. */
@Component({
  selector: 'app-project-launch-fields',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="plf">
      <div class="form-row">
        <div class="form-group">
          <label>Developer <span class="required">*</span></label>
          <select [(ngModel)]="form.developer_id" name="developer_id">
            <option [ngValue]="null" disabled>Select a developer…</option>
            <option *ngFor="let d of developers" [ngValue]="d.id">{{ d.name_en || d.name_ar }}</option>
          </select>
          <small class="hint" *ngIf="!developers.length">No developers yet — add one under Developers first.</small>
        </div>
        <div class="form-group">
          <label>Area (state)</label>
          <select [(ngModel)]="form.state" name="state">
            <option [ngValue]="null">— not set —</option>
            <option *ngFor="let s of states" [ngValue]="s.value">{{ s.label }}</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Location label (English)</label>
          <input type="text" [(ngModel)]="form.area_en" name="area_en" placeholder="Sidi Abdelrahman" />
        </div>
        <div class="form-group">
          <label>Location label (Arabic)</label>
          <input type="text" [(ngModel)]="form.area_ar" name="area_ar" dir="rtl" placeholder="سيدي عبد الرحمن" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group check-group">
          <label class="checkbox-label">
            <input type="checkbox" [(ngModel)]="form.is_new_launch" name="is_new_launch" />
            <span>Show in “New launches” on Explore</span>
          </label>
        </div>
        <div class="form-group" *ngIf="form.is_new_launch">
          <label>Launch date</label>
          <input type="date" [(ngModel)]="form.launched_at" name="launched_at" />
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    select {
      padding: 0.7rem 0.9rem; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem;
      color: #1a1f2e; width: 100%; box-sizing: border-box; background: #fff; font-family: inherit; outline: none;
      &:focus { border-color: #1e3a6e; box-shadow: 0 0 0 3px #e8ecf5; }
    }
    .hint { color: #b45309; font-size: 0.78rem; }
  `],
  styleUrls: [],
})
export class ProjectLaunchFieldsComponent {
  @Input({ required: true }) form!: Pick<CreateProjectDto,
    'developer_id' | 'is_new_launch' | 'launched_at' | 'state' | 'area_ar' | 'area_en'>;
  @Input() developers: Developer[] = [];
  readonly states = PROJECT_STATES;
}
