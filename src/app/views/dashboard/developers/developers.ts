import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DeveloperService } from '../../../core/services/developer.service';
import { Developer } from '../../../core/models/developer.model';

@Component({
  selector: 'app-developers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './developers.html',
  styleUrl: './developers.scss',
})
export class DevelopersComponent implements OnInit {
  developers: Developer[] = [];
  isLoading = false;

  constructor(
    private developerService: DeveloperService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDevelopers();
  }

  loadDevelopers(): void {
    this.isLoading = true;
    this.developerService.getAll().subscribe({
      next: (res) => {
        this.developers = res.data;
        this.isLoading  = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToNew(): void {
    this.router.navigate(['/dashboard/developers/new']);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/dashboard/developers', id]);
  }
}
