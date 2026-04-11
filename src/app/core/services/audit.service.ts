import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OperationAuditItem {
  id: number;
  operationType: string;
  status: string;
  message: string;
  createdAt: string;
  clientId?: number;
  compteSourceId?: number;
  compteDestinationId?: number;
  beneficiaireId?: number;
  montant?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private readonly API_URL = `${environment.apiUrl}/api/audits`;

  constructor(private http: HttpClient) {}

  getMyAudits(): Observable<OperationAuditItem[]> {
    return this.http.get<OperationAuditItem[]>(`${this.API_URL}/me`);
  }
}
