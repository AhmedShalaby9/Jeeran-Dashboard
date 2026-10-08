import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompoundService } from '../../../core/services/compound.service';
import { Compound } from '../../../core/models/compound.model';

@Component({
  selector: 'app-compounds',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compounds.html',
  styleUrl: './compounds.scss',
})
export class CompoundsComponent implements OnInit {
  compounds: Compound[] = [];
  isLoading = false;

  constructor(
    private compoundService: CompoundService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCompounds();
  }

  loadCompounds(): void {
    this.isLoading = true;
    this.compoundService.getAll().subscribe({
      next: (res) => {
        this.compounds  = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToNew(): void {
    this.router.navigate(['/dashboard/compounds/new']);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/dashboard/compounds', id]);
  }
}
