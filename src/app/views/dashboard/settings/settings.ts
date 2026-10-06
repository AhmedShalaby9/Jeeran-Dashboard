import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingService } from '../../../core/services/setting.service';
import { AppSettings } from '../../../core/models/setting.model';
import { MediaUploaderComponent } from '../../../shared/components/media-uploader/media-uploader';

type Tab = 'app' | 'terms' | 'about' | 'privacy' | 'ai-ads' | 'banners' | 'guide-video';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUploaderComponent],
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
    min_version_ios:      '',
    min_version_android:  '',
    app_store_url:        '',
    google_play_url:      '',
    terms_en:             '',
    terms_ar:             '',
    about_us_en:          '',
    about_us_ar:          '',
    privacy_policy_en:    '',
    privacy_policy_ar:    '',
    ad_generation_price:  50,
    ad_generation_trials: 5,
    in_review:            false,
    promo_ai_ads_visible: true,
    promo_seller_visible: true,
    promo_ai_ads_order:   1,
    promo_seller_order:   2,
    ai_guide_video_url:     '',
    ai_guide_video_visible: false,
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

  get aiAdsFirst(): boolean {
    return this.form.promo_ai_ads_order < this.form.promo_seller_order;
  }

  onGuideVideoUploaded(urls: string[]): void {
    if (urls[0]) this.form.ai_guide_video_url = urls[0];
  }

  set aiAdsFirst(val: boolean) {
    this.form.promo_ai_ads_order = val ? 1 : 2;
    this.form.promo_seller_order = val ? 2 : 1;
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
