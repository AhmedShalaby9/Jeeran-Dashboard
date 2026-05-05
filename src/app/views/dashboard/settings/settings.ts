import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingService } from '../../../core/services/setting.service';
import { AppSettings } from '../../../core/models/setting.model';

type Tab = 'app' | 'terms' | 'about';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class SettingsComponent implements OnInit {
  activeTab: Tab = 'app';
  isLoading    = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage   = '';

  form: AppSettings = {
    min_version_ios:     '',
    min_version_android: '',
    app_store_url:       '',
    google_play_url:     '',
    terms_en:            '',
    terms_ar:            '',
    about_us_en:         '',
    about_us_ar:         '',
  };

  constructor(private settingService: SettingService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.settingService.get().subscribe({
      next: (res) => {
        this.form      = { ...res.data };
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
  }

  save(): void {
    this.isSubmitting  = true;
    this.errorMessage  = '';
    this.successMessage = '';

    this.settingService.update(this.form).subscribe({
      next: (res) => {
        this.form           = { ...res.data };
        this.isSubmitting   = false;
        this.successMessage = 'Settings saved successfully.';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to save settings.';
        this.cdr.detectChanges();
      },
    });
  }
}
