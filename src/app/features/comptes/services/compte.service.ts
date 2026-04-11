import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Compte {
  id: number;
  numero: string;
  numeroCompte?: string;
  solde: number;
  devise: string;
  type: string;
  dateCreation: string;
}

export interface CompteRequest {
  numero: string;
  type: string;
  devise: string;
}

export interface PageableCompte {
  content: Compte[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface Transaction {
  id: number;
  type: string;
  montant: number;
  dateTransaction: string;
  description: string;
  compteId: number;
}

export interface PageableTransaction {
  content: Transaction[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface TransactionFilters {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  montantMin?: number;
  montantMax?: number;
}

export interface VirementInterneRequest {
  compteSourceId: number;
  compteDestinationId: number;
  montant: number;
  description?: string;
}

export interface Beneficiaire {
  id: number;
  nom: string;
  iban?: string;
  rib?: string;
  banque?: string;
  email?: string;
}

export interface BeneficiaireRequest {
  nom: string;
  iban?: string;
  rib?: string;
  banque?: string;
  email?: string;
}

export interface VirementExterneRequest {
  compteSourceId: number;
  beneficiaireId: number;
  montant: number;
  description?: string;
}

export interface TransferLimitStatus {
  maxSingleAmount: number;
  maxDailyTotal: number;
  maxDailyCount: number;
  minIntervalSeconds: number;
  todayOutgoingTotal: number;
  remainingDailyAmount: number;
  todayOutgoingCount: number;
  remainingDailyCount: number;
  remainingCooldownSeconds: number;
}

export interface TransferRiskAssessment {
  score: number;
  level: 'FAIBLE' | 'MOYEN' | 'ELEVE';
  blocked: boolean;
  message: string;
  operationType: 'INTERNE' | 'EXTERNE';
  riskProfile?: 'SENSIBLE' | 'STANDARD' | 'VIP';
  blockThreshold: number;
  amountRatio: number;
  dailyAmountRatio: number;
  dailyCountRatio: number;
  amountScore: number;
  dailyAmountScore: number;
  dailyCountScore: number;
}

export interface AuditRecord {
  id: number;
  operationType: string;
  status: string;
  message: string;
  createdAt: string;
  clientId: number;
  compteSourceId?: number;
  compteDestinationId?: number;
  beneficiaireId?: number;
  montant?: number;
  riskScore?: number;
  riskLevel?: string;
  riskBlocked?: boolean;
  riskDetails?: any;
}

export interface PageableAuditRecord {
  content: AuditRecord[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class CompteService {
  private readonly API_URL = `${environment.apiUrl}/api/comptes`;
  private readonly TRANSACTION_API_URL = `${environment.apiUrl}/api/transactions`;
  private readonly BENEFICIAIRE_API_URL = `${environment.apiUrl}/api/beneficiaires`;

  constructor(private http: HttpClient) {}

  getComptes(page: number = 0, size: number = 10): Observable<PageableCompte> {
    return this.http.get<PageableCompte>(`${this.API_URL}?page=${page}&size=${size}`);
  }

  getMyComptes(page: number = 0, size: number = 10): Observable<PageableCompte> {
    return this.http.get<PageableCompte>(`${this.API_URL}/me?page=${page}&size=${size}`);
  }

  getCompte(id: number): Observable<Compte> {
    return this.http.get<Compte>(`${this.API_URL}/${id}`);
  }

  createCompte(request: CompteRequest): Observable<Compte> {
    return this.http.post<Compte>(this.API_URL, request);
  }

  updateCompte(id: number, request: Partial<CompteRequest>): Observable<Compte> {
    return this.http.put<Compte>(`${this.API_URL}/${id}`, request);
  }

  deleteCompte(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getCompteTransactions(
    compteId: number,
    filters: TransactionFilters = {},
    page: number = 0,
    size: number = 10
  ): Observable<PageableTransaction> {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('size', size.toString());

    if (filters.type) params.set('type', filters.type);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.montantMin != null) params.set('montantMin', filters.montantMin.toString());
    if (filters.montantMax != null) params.set('montantMax', filters.montantMax.toString());

    return this.http.get<PageableTransaction>(
      `${this.TRANSACTION_API_URL}/me/compte/${compteId}?${params.toString()}`
    );
  }

  effectuerVirementInterne(request: VirementInterneRequest): Observable<void> {
    return this.http.post<void>(`${this.TRANSACTION_API_URL}/me/virement-interne`, request);
  }

  effectuerVirementExterne(request: VirementExterneRequest): Observable<void> {
    return this.http.post<void>(`${this.TRANSACTION_API_URL}/me/virement-externe`, request);
  }

  getMyTransferLimits(): Observable<TransferLimitStatus> {
    return this.http.get<TransferLimitStatus>(`${this.TRANSACTION_API_URL}/me/limits`);
  }

  getMyTransferRiskPreview(montant: number, type: 'INTERNE' | 'EXTERNE'): Observable<TransferRiskAssessment> {
    return this.http.get<TransferRiskAssessment>(`${this.TRANSACTION_API_URL}/me/risk-preview?montant=${montant}&type=${type}`);
  }

  getMyTransferAuditHistory(page: number = 0, size: number = 10): Observable<PageableAuditRecord> {
    return this.http.get<PageableAuditRecord>(`${this.TRANSACTION_API_URL}/me/audit?page=${page}&size=${size}`);
  }

  getMyBeneficiaires(): Observable<Beneficiaire[]> {
    return this.http.get<Beneficiaire[]>(`${this.BENEFICIAIRE_API_URL}/me`);
  }

  createMyBeneficiaire(request: BeneficiaireRequest): Observable<Beneficiaire> {
    return this.http.post<Beneficiaire>(`${this.BENEFICIAIRE_API_URL}/me`, request);
  }

  deleteMyBeneficiaire(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BENEFICIAIRE_API_URL}/me/${id}`);
  }
}
