import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CompteService, PageableCompte } from '../services/compte.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-compte-list',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './compte-list.component.html',
  styleUrls: ['./compte-list.component.scss']
})
export class CompteListComponent implements OnInit {
  comptes: PageableCompte | null = null;
  loading = true;
  error: string | null = null;
  currentPage = 0;
  pageSize = 10;

  constructor(private compteService: CompteService) {}

  ngOnInit(): void {
    this.loadComptes();
  }

  loadComptes(): void {
    this.loading = true;
    this.error = null;

    this.compteService.getComptes(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.comptes = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des comptes';
        this.loading = false;
      }
    });
  }

  deleteCompte(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte?')) {
      this.compteService.deleteCompte(id).subscribe({
        next: () => {
          this.loadComptes();
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression';
        }
      });
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadComptes();
  }

  nextPage(): void {
    if (this.comptes && this.currentPage < this.comptes.totalPages - 1) {
      this.onPageChange(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.onPageChange(this.currentPage - 1);
    }
  }
}
