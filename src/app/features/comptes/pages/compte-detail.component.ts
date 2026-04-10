import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  CompteService,
  Compte,
  Transaction,
  TransactionFilters
} from '../services/compte.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-compte-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './compte-detail.component.html',
  styleUrls: ['./compte-detail.component.scss']
})
export class CompteDetailComponent implements OnInit {
  compte: Compte | null = null;
  transactions: Transaction[] = [];
  loading = true;
  error: string | null = null;
  txLoading = false;
  txError: string | null = null;

  txFilters: TransactionFilters = {};
  txPage = 0;
  txSize = 5;
  txTotalPages = 0;

  constructor(
    private route: ActivatedRoute,
    private compteService: CompteService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCompte(+id);
    }
  }

  loadCompte(id: number): void {
    this.compteService.getCompte(id).subscribe({
      next: (data) => {
        this.compte = data;
        this.loading = false;
        this.loadTransactions();
      },
      error: (err) => {
        this.error = 'Compte non trouvé';
        this.loading = false;
      }
    });
  }

  loadTransactions(page: number = 0): void {
    if (!this.compte?.id) {
      return;
    }

    this.txLoading = true;
    this.txError = null;
    this.txPage = page;

    const filters: TransactionFilters = {
      ...this.txFilters,
      dateFrom: this.toIsoDateTime(this.txFilters.dateFrom),
      dateTo: this.toIsoDateTime(this.txFilters.dateTo)
    };

    this.compteService.getCompteTransactions(this.compte.id, filters, this.txPage, this.txSize).subscribe({
      next: (response) => {
        this.transactions = response.content;
        this.txTotalPages = response.totalPages;
        this.txLoading = false;
      },
      error: () => {
        this.txError = 'Impossible de charger l\'historique des transactions';
        this.txLoading = false;
      }
    });
  }

  applyTransactionFilters(): void {
    this.loadTransactions(0);
  }

  clearTransactionFilters(): void {
    this.txFilters = {};
    this.loadTransactions(0);
  }

  previousTxPage(): void {
    if (this.txPage > 0) {
      this.loadTransactions(this.txPage - 1);
    }
  }

  nextTxPage(): void {
    if (this.txPage + 1 < this.txTotalPages) {
      this.loadTransactions(this.txPage + 1);
    }
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
