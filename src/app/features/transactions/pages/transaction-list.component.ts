import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  Compte,
  CompteService,
  Transaction,
  TransactionFilters
} from '../../comptes/services/compte.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit {
  comptes: Compte[] = [];
  selectedCompteId: number | null = null;

  transactions: Transaction[] = [];
  filters: TransactionFilters = {};

  page = 0;
  size = 10;
  totalPages = 0;

  loading = true;
  txLoading = false;
  error: string | null = null;

  constructor(private compteService: CompteService) {}

  ngOnInit(): void {
    this.loadMyComptes();
  }

  loadMyComptes(): void {
    this.loading = true;
    this.error = null;

    this.compteService.getMyComptes(0, 100).subscribe({
      next: (response) => {
        this.comptes = response.content;
        this.selectedCompteId = this.comptes.length > 0 ? this.comptes[0].id : null;
        this.loading = false;

        if (this.selectedCompteId) {
          this.loadTransactions(0);
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Impossible de charger vos comptes';
      }
    });
  }

  onCompteChange(): void {
    this.loadTransactions(0);
  }

  applyFilters(): void {
    this.loadTransactions(0);
  }

  resetFilters(): void {
    this.filters = {};
    this.loadTransactions(0);
  }

  previousPage(): void {
    if (this.page > 0) {
      this.loadTransactions(this.page - 1);
    }
  }

  nextPage(): void {
    if (this.page + 1 < this.totalPages) {
      this.loadTransactions(this.page + 1);
    }
  }

  private loadTransactions(page: number): void {
    if (!this.selectedCompteId) {
      this.transactions = [];
      this.totalPages = 0;
      return;
    }

    this.txLoading = true;
    this.error = null;
    this.page = page;

    const filters: TransactionFilters = {
      ...this.filters,
      dateFrom: this.toIsoDateTime(this.filters.dateFrom),
      dateTo: this.toIsoDateTime(this.filters.dateTo)
    };

    this.compteService.getCompteTransactions(this.selectedCompteId, filters, this.page, this.size).subscribe({
      next: (response) => {
        this.transactions = response.content;
        this.totalPages = response.totalPages;
        this.txLoading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les transactions';
        this.txLoading = false;
      }
    });
  }

  getCompteLabel(compte: Compte): string {
    const numero = compte.numeroCompte || compte.numero || `Compte #${compte.id}`;
    return `${numero} (${compte.devise})`;
  }

  private toIsoDateTime(value?: string): string | undefined {
    if (!value) {
      return undefined;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    return date.toISOString();
  }
}
