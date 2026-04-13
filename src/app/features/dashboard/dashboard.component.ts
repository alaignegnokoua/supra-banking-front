import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationItem, NotificationService } from '../../core/services/notification.service';
import { Subject, interval } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { AdminClient, AdminClientService, RiskProfile, UpdateTransferLimitsRequest } from '../../core/services/admin-client.service';
import { DashboardService, DashboardStatistics, MonthlyReport } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser$ = this.authService.currentUser$;
  isAuthenticated$ = this.authService.isAuthenticated$;
  notifications: NotificationItem[] = [];
  unreadCount = 0;
  notificationError: string | null = null;
  autoRefreshSeconds = 15;

  adminClients: AdminClient[] = [];
  adminRiskLoading = false;
  adminRiskError: string | null = null;
  adminRiskSuccess: string | null = null;
  updatingRiskForClientId: number | null = null;
  updatingLimitsForClientId: number | null = null;
  readonly riskProfiles: RiskProfile[] = ['SENSIBLE', 'STANDARD', 'VIP'];
  selectedRiskProfiles: Record<number, RiskProfile> = {};
  selectedTransferLimits: Record<number, UpdateTransferLimitsRequest> = {};

  // Dashboard statistics
  dashboardStats: DashboardStatistics | null = null;
  dashboardLoading = false;
  dashboardError: string | null = null;

  monthlyReport: MonthlyReport | null = null;
  monthlyReportLoading = false;
  monthlyReportError: string | null = null;
  selectedReportMonth = this.getCurrentMonthInput();

  private readonly destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private adminClientService: AdminClientService
      ,
    private dashboardService: DashboardService
  ) {}

  private getCurrentMonthInput(): string {
    const now = new Date();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    return `${now.getFullYear()}-${month}`;
  }

  ngOnInit(): void {
    interval(this.autoRefreshSeconds * 1000)
      .pipe(startWith(0), takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadNotifications();
      });

    if (this.isAdmin()) {
      this.loadDashboardStatistics();
      this.loadAdminClientsForRiskProfiles();
      this.loadMonthlyReport();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    this.notificationError = null;
    this.notificationService.getMyNotifications().subscribe({
      next: (items) => {
        this.notifications = items;
        this.loadUnreadCount();
      },
      error: () => {
        this.notificationError = 'Impossible de charger les notifications';
      }
    });
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => this.loadNotifications(),
      error: () => {
        this.notificationError = 'Impossible de marquer la notification comme lue';
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => this.loadNotifications(),
      error: () => {
        this.notificationError = 'Impossible de marquer toutes les notifications comme lues';
      }
    });
  }

  deleteNotification(id: number): void {
    this.notificationService.deleteMyNotification(id).subscribe({
      next: () => this.loadNotifications(),
      error: () => {
        this.notificationError = 'Impossible de supprimer la notification';
      }
    });
  }

  isFraudAlert(content: string): boolean {
    if (!content) {
      return false;
    }
    return content.toUpperCase().includes('ALERTE FRAUDE');
  }

  clearReadNotifications(): void {
    this.notificationService.deleteMyReadNotifications().subscribe({
      next: () => this.loadNotifications(),
      error: () => {
        this.notificationError = 'Impossible de nettoyer les notifications lues';
      }
    });
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  loadAdminClientsForRiskProfiles(): void {
    this.adminRiskError = null;
    this.adminRiskSuccess = null;
    this.adminRiskLoading = true;

    this.adminClientService.getClients(0, 100).subscribe({
      next: (response) => {
        this.adminClients = response.content;
        this.selectedRiskProfiles = {};
        this.selectedTransferLimits = {};
        this.adminClients.forEach((client) => {
          this.selectedRiskProfiles[client.id] = client.riskProfile ?? 'STANDARD';
          this.selectedTransferLimits[client.id] = {
            maxSingleTransferAmount: client.customMaxSingleTransferAmount ?? null,
            maxDailyTransferTotal: client.customMaxDailyTransferTotal ?? null,
            maxDailyTransferCount: client.customMaxDailyTransferCount ?? null,
            minTransferIntervalSeconds: client.customMinTransferIntervalSeconds ?? null
          };
        });
        this.adminRiskLoading = false;
      },
      error: () => {
        this.adminRiskError = 'Impossible de charger les clients pour le pilotage du risque';
        this.adminRiskLoading = false;
      }
    });
  }

  updateClientRiskProfile(clientId: number): void {
    const profile = this.selectedRiskProfiles[clientId] ?? 'STANDARD';
    this.adminRiskError = null;
    this.adminRiskSuccess = null;
    this.updatingRiskForClientId = clientId;

    this.adminClientService.updateRiskProfile(clientId, profile).subscribe({
      next: (updated) => {
        this.selectedRiskProfiles[clientId] = updated.riskProfile ?? profile;
        this.adminRiskSuccess = `Profil de risque mis à jour pour ${updated.prenom} ${updated.nom}`;
        this.updatingRiskForClientId = null;
      },
      error: () => {
        this.adminRiskError = 'Échec de la mise à jour du profil de risque';
        this.updatingRiskForClientId = null;
      }
    });
  }

  updateClientTransferLimits(clientId: number): void {
    const payload = this.selectedTransferLimits[clientId];
    if (!payload) {
      return;
    }

    this.adminRiskError = null;
    this.adminRiskSuccess = null;
    this.updatingLimitsForClientId = clientId;

    this.adminClientService.updateTransferLimits(clientId, payload).subscribe({
      next: (updated) => {
        this.selectedTransferLimits[clientId] = {
          maxSingleTransferAmount: updated.customMaxSingleTransferAmount ?? null,
          maxDailyTransferTotal: updated.customMaxDailyTransferTotal ?? null,
          maxDailyTransferCount: updated.customMaxDailyTransferCount ?? null,
          minTransferIntervalSeconds: updated.customMinTransferIntervalSeconds ?? null
        };
        this.adminRiskSuccess = `Plafonds personnalisés mis à jour pour ${updated.prenom} ${updated.nom}`;
        this.updatingLimitsForClientId = null;
      },
      error: (err) => {
        this.adminRiskError = err?.error?.message || 'Échec de la mise à jour des plafonds personnalisés';
        this.updatingLimitsForClientId = null;
      }
    });
  }

  private loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (response) => {
        this.unreadCount = response.unreadCount;
      },
      error: () => {
        this.unreadCount = 0;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  loadDashboardStatistics(): void {
    this.dashboardError = null;
    this.dashboardLoading = true;
    
    this.dashboardService.getDashboardStatistics().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.dashboardLoading = false;
      },
      error: () => {
        this.dashboardError = 'Impossible de charger les statistiques du tableau de bord';
        this.dashboardLoading = false;
      }
    });
  }

  loadMonthlyReport(): void {
    const [yearText, monthText] = (this.selectedReportMonth || '').split('-');
    const year = Number(yearText);
    const month = Number(monthText);

    if (!year || !month) {
      this.monthlyReportError = 'Veuillez sélectionner un mois valide';
      return;
    }

    this.monthlyReportLoading = true;
    this.monthlyReportError = null;

    this.dashboardService.getMonthlyReport(year, month).subscribe({
      next: (report) => {
        this.monthlyReport = report;
        this.monthlyReportLoading = false;
      },
      error: () => {
        this.monthlyReportError = 'Impossible de charger le rapport mensuel';
        this.monthlyReportLoading = false;
      }
    });
  }

  downloadTransactionsCsv(): void {
    const [yearText, monthText] = (this.selectedReportMonth || '').split('-');
    const year = Number(yearText);
    const month = Number(monthText);

    if (!year || !month) {
      this.monthlyReportError = 'Veuillez sélectionner un mois valide';
      return;
    }

    this.dashboardService.exportMonthlyTransactionsCsv(year, month).subscribe({
      next: (blob) => this.downloadBlob(blob, `transactions-${year}-${`${month}`.padStart(2, '0')}.csv`),
      error: () => this.monthlyReportError = 'Échec du téléchargement des transactions CSV'
    });
  }

  downloadAuditsCsv(): void {
    const [yearText, monthText] = (this.selectedReportMonth || '').split('-');
    const year = Number(yearText);
    const month = Number(monthText);

    if (!year || !month) {
      this.monthlyReportError = 'Veuillez sélectionner un mois valide';
      return;
    }

    this.dashboardService.exportMonthlyAuditsCsv(year, month).subscribe({
      next: (blob) => this.downloadBlob(blob, `audits-${year}-${`${month}`.padStart(2, '0')}.csv`),
      error: () => this.monthlyReportError = 'Échec du téléchargement des audits CSV'
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
