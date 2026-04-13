import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationItem, NotificationService } from '../../core/services/notification.service';
import { Subject, interval } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { AdminClient, AdminClientService, RiskProfile } from '../../core/services/admin-client.service';
import { DashboardService, DashboardStatistics } from '../../core/services/dashboard.service';

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
  readonly riskProfiles: RiskProfile[] = ['SENSIBLE', 'STANDARD', 'VIP'];
  selectedRiskProfiles: Record<number, RiskProfile> = {};

  // Dashboard statistics
  dashboardStats: DashboardStatistics | null = null;
  dashboardLoading = false;
  dashboardError: string | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private adminClientService: AdminClientService
      ,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    interval(this.autoRefreshSeconds * 1000)
      .pipe(startWith(0), takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadNotifications();
      });

    if (this.isAdmin()) {
      this.loadDashboardStatistics();
      this.loadAdminClientsForRiskProfiles();
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
        this.adminClients.forEach((client) => {
          this.selectedRiskProfiles[client.id] = client.riskProfile ?? 'STANDARD';
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
}
