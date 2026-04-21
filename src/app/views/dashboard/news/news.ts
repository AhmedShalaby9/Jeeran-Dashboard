import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NewsService } from '../../../core/services/news.service';
import { News } from '../../../core/models/news.model';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news.html',
  styleUrl: './news.scss',
})
export class NewsComponent implements OnInit {
  newsList: News[] = [];
  isLoading = false;

  constructor(
    private newsService: NewsService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.newsService.getAll().subscribe({
      next: (res) => {
        this.newsList  = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  isVideo(url: string): boolean {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  }

  goToNew(): void {
    this.router.navigate(['/dashboard/news/new']);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/dashboard/news', id]);
  }
}
