import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from '../../../core/services/upload.service';

@Component({
  selector: 'app-media-uploader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media-uploader.html',
  styleUrl: './media-uploader.scss',
})
export class MediaUploaderComponent {
  /** Destination folder on the server (e.g. "properties", "banners") */
  @Input() folder  = 'general';
  /** Allow picking multiple files at once */
  @Input() multiple = false;
  /** Accept filter for the file picker */
  @Input() accept  = 'image/*';
  /** Emits the uploaded URL(s) after a successful upload */
  @Output() uploaded = new EventEmitter<string[]>();

  uploading = false;
  error     = '';

  constructor(private uploadService: UploadService, private cdr: ChangeDetectorRef) {}

  onFilesSelected(event: Event): void {
    const input   = event.target as HTMLInputElement;
    const files   = Array.from(input.files ?? []);
    input.value   = ''; // reset so same file can be picked again
    if (!files.length) return;

    this.uploading = true;
    this.error     = '';
    this.cdr.detectChanges();

    if (!this.multiple || files.length === 1) {
      this.uploadService.uploadSingle(files[0], this.folder).subscribe({
        next: (url) => {
          this.uploading = false;
          this.uploaded.emit([url]);
          this.cdr.detectChanges();
        },
        error: () => {
          this.uploading = false;
          this.error     = 'Upload failed. Please try again.';
          this.cdr.detectChanges();
        },
      });
    } else {
      this.uploadService.uploadMultiple(files, this.folder).subscribe({
        next: (urls) => {
          this.uploading = false;
          this.uploaded.emit(urls);
          this.cdr.detectChanges();
        },
        error: () => {
          this.uploading = false;
          this.error     = 'Upload failed. Please try again.';
          this.cdr.detectChanges();
        },
      });
    }
  }
}
