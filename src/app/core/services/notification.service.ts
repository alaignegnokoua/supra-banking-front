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
}
