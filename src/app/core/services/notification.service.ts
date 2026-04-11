import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NotificationItem {
  id: number;
  contenu: string;
  dateEnvoi: string;
  statut: string;
}

export interface NotificationUnreadCount {
  unreadCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = `${environment.apiUrl}/api/notifications`;

  constructor(private http: HttpClient) {}

  getMyNotifications(): Observable<NotificationItem[]> {
    return this.http.get<NotificationItem[]>(`${this.API_URL}/me`);
  }

  markAsRead(id: number): Observable<NotificationItem> {
    return this.http.patch<NotificationItem>(`${this.API_URL}/me/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/me/read-all`, {});
  }

  getUnreadCount(): Observable<NotificationUnreadCount> {
    return this.http.get<NotificationUnreadCount>(`${this.API_URL}/me/unread-count`);
  }

  deleteMyNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/me/${id}`);
  }

  deleteMyReadNotifications(): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/me/read`);
  }
}
