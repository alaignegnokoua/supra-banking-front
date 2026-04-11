import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type RiskProfile = 'SENSIBLE' | 'STANDARD' | 'VIP';

export interface AdminClient {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  identifiant: string;
  riskProfile?: RiskProfile;
}

export interface PageableAdminClient {
  content: AdminClient[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminClientService {
  private readonly API_URL = `${environment.apiUrl}/api/clients`;

  constructor(private http: HttpClient) {}

  getClients(page: number = 0, size: number = 50): Observable<PageableAdminClient> {
    return this.http.get<PageableAdminClient>(`${this.API_URL}?page=${page}&size=${size}`);
  }

  updateRiskProfile(clientId: number, riskProfile: RiskProfile): Observable<AdminClient> {
    return this.http.patch<AdminClient>(`${this.API_URL}/${clientId}/risk-profile`, { riskProfile });
  }
}
