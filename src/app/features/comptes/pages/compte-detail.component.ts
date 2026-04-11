import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  CompteService,
  Compte,
  Transaction,
  TransactionFilters,
  Beneficiaire,
  BeneficiaireRequest
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
  myComptes: Compte[] = [];
  transactions: Transaction[] = [];
  loading = true;
  error: string | null = null;
  txLoading = false;
  txError: string | null = null;

  txFilters: TransactionFilters = {};
  txPage = 0;
  txSize = 5;
  txTotalPages = 0;

  transferDestinationId: number | null = null;
  transferAmount: number | null = null;
  transferDescription = '';
  transferLoading = false;
  transferError: string | null = null;
  transferSuccess: string | null = null;

  beneficiaires: Beneficiaire[] = [];
  benLoading = false;
  benError: string | null = null;
  benSuccess: string | null = null;

  newBeneficiaire: BeneficiaireRequest = { nom: '', iban: '', rib: '', banque: '', email: '' };

  extBeneficiaireId: number | null = null;
  extAmount: number | null = null;
  extDescription = '';
  extLoading = false;
  extError: string | null = null;
  extSuccess: string | null = null;

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
        this.loadMyComptes();
        this.loadBeneficiaires();
        this.loadTransactions();
      },
      error: (err) => {
        this.error = 'Compte non trouvé';
        this.loading = false;
      }
    });
  }

  loadMyComptes(): void {
    this.compteService.getComptes(0, 100).subscribe({
      next: (response) => {
        const currentId = this.compte?.id;
        this.myComptes = response.content.filter(c => c.id !== currentId);
      },
      error: () => {
        this.myComptes = [];
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

  submitInternalTransfer(): void {
    this.transferError = null;
    this.transferSuccess = null;

    if (!this.compte?.id) {
      return;
    }

    if (!this.transferDestinationId || !this.transferAmount || this.transferAmount <= 0) {
      this.transferError = 'Veuillez sélectionner un compte destination et un montant valide';
      return;
    }

    this.transferLoading = true;
    this.compteService.effectuerVirementInterne({
      compteSourceId: this.compte.id,
      compteDestinationId: this.transferDestinationId,
      montant: this.transferAmount,
      description: this.transferDescription?.trim() || undefined
    }).subscribe({
      next: () => {
        this.transferLoading = false;
        this.transferSuccess = 'Virement interne effectué avec succès';
        this.transferAmount = null;
        this.transferDescription = '';
        this.loadCompte(this.compte!.id);
      },
      error: (err) => {
        this.transferLoading = false;
        this.transferError = err?.error?.message || 'Échec du virement interne';
      }
    });
  }

  loadBeneficiaires(): void {
    this.benLoading = true;
    this.benError = null;

    this.compteService.getMyBeneficiaires().subscribe({
      next: (items) => {
        this.beneficiaires = items;
        this.benLoading = false;
      },
      error: () => {
        this.benError = 'Impossible de charger les bénéficiaires';
        this.benLoading = false;
      }
    });
  }

  createBeneficiaire(): void {
    this.benError = null;
    this.benSuccess = null;

    if (!this.newBeneficiaire.nom?.trim()) {
      this.benError = 'Le nom du bénéficiaire est obligatoire';
      return;
    }

    this.benLoading = true;
    this.compteService.createMyBeneficiaire({
      ...this.newBeneficiaire,
      nom: this.newBeneficiaire.nom.trim()
    }).subscribe({
      next: () => {
        this.benSuccess = 'Bénéficiaire ajouté avec succès';
        this.newBeneficiaire = { nom: '', iban: '', rib: '', banque: '', email: '' };
        this.loadBeneficiaires();
      },
      error: (err) => {
        this.benError = err?.error?.message || 'Échec lors de l\'ajout du bénéficiaire';
        this.benLoading = false;
      }
    });
  }

  deleteBeneficiaire(id: number): void {
    this.benError = null;
    this.benSuccess = null;

    this.compteService.deleteMyBeneficiaire(id).subscribe({
      next: () => {
        this.benSuccess = 'Bénéficiaire supprimé';
        this.loadBeneficiaires();
      },
      error: (err) => {
        this.benError = err?.error?.message || 'Échec lors de la suppression';
      }
    });
  }

  submitExternalTransfer(): void {
    this.extError = null;
    this.extSuccess = null;

    if (!this.compte?.id) {
      return;
    }

    if (!this.extBeneficiaireId || !this.extAmount || this.extAmount <= 0) {
      this.extError = 'Veuillez choisir un bénéficiaire et un montant valide';
      return;
    }

    this.extLoading = true;
    this.compteService.effectuerVirementExterne({
      compteSourceId: this.compte.id,
      beneficiaireId: this.extBeneficiaireId,
      montant: this.extAmount,
      description: this.extDescription?.trim() || undefined
    }).subscribe({
      next: () => {
        this.extLoading = false;
        this.extSuccess = 'Virement externe effectué avec succès';
        this.extAmount = null;
        this.extDescription = '';
        this.loadCompte(this.compte!.id);
      },
      error: (err) => {
        this.extLoading = false;
        this.extError = err?.error?.message || 'Échec du virement externe';
      }
    });
  }

  getCompteLabel(compte: Compte): string {
    const numero = compte.numeroCompte || compte.numero || `Compte #${compte.id}`;
    return `${numero} (Solde: ${compte.solde ?? 0})`;
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
