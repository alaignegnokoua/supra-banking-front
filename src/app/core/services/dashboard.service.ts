import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStatistics {
  totalClients: number;
  activeClientsToday: number;
  totalComptes: number;
  transfersToday: number;
  internalTransfers: number;
  externalTransfers: number;
  blockedTransfersToday: number;
  blockageRate: number;
  averageTransactionAmount: number;
  totalTransactionAmount: number;
  fraudAlertsToday: number;
  riskLevelFaible: number;
  riskLevelMoyen: number;
  riskLevelEleve: number;
  totalBeneficiaries: number;
  activeBeneficiariesToday: number;
  newBeneficiariesThisMonth: number;
  unreadNotifications: number;
  notificationsThisMonth: number;
  systemDatabaseHealth: number;
  systemResponseTime: number;
  systemUptime: number;
}

export interface MonthlyReport {
  year: number;
  month: number;
  totalTransactions: number;
  totalTransactionsAmount: number;
  totalInternalTransfers: number;
  totalExternalTransfers: number;
  blockedTransfers: number;
  totalAuditEntries: number;
  successfulAuditEntries: number;
  failedAuditEntries: number;
  summary: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly ADMIN_API_URL = `${environment.apiUrl}/api/admin/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardStatistics(): Observable<DashboardStatistics> {
    return this.http.get<DashboardStatistics>(`${this.ADMIN_API_URL}/statistics`);
  }

  getTotalClients(): Observable<{ totalClients: number }> {
    return this.http.get<{ totalClients: number }>(`${this.ADMIN_API_URL}/statistics/total-clients`);
  }

  getActiveClientsToday(): Observable<{ activeClientsToday: number }> {
    return this.http.get<{ activeClientsToday: number }>(`${this.ADMIN_API_URL}/clients/active-today`);
  }

  getTransfersToday(): Observable<{ transfersToday: number }> {
    return this.http.get<{ transfersToday: number }>(`${this.ADMIN_API_URL}/transactions/today`);
  }

  getBlockedTransfersToday(): Observable<{ blockedTransfersToday: number }> {
    return this.http.get<{ blockedTransfersToday: number }>(`${this.ADMIN_API_URL}/transactions/blocked-today`);
  }

  getTotalTransactions(): Observable<{ totalTransactions: number }> {
    return this.http.get<{ totalTransactions: number }>(`${this.ADMIN_API_URL}/statistics/total-transactions`);
  }

  getTotalBeneficiaries(): Observable<{ totalBeneficiaries: number }> {
    return this.http.get<{ totalBeneficiaries: number }>(`${this.ADMIN_API_URL}/statistics/total-beneficiaries`);
  }

  getMonthlyReport(year: number, month: number): Observable<MonthlyReport> {
    return this.http.get<MonthlyReport>(`${this.ADMIN_API_URL}/reports/monthly?year=${year}&month=${month}`);
  }

  exportMonthlyTransactionsCsv(year: number, month: number): Observable<Blob> {
    return this.http.get(`${this.ADMIN_API_URL}/reports/monthly/transactions.csv?year=${year}&month=${month}`, {
      responseType: 'blob'
    });
  }

  exportMonthlyAuditsCsv(year: number, month: number): Observable<Blob> {
    return this.http.get(`${this.ADMIN_API_URL}/reports/monthly/audits.csv?year=${year}&month=${month}`, {
      responseType: 'blob'
    });
  }
}
