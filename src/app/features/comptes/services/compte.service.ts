import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Compte {
  id: number;
  numero: string;
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

@Injectable({
  providedIn: 'root'
})
export class CompteService {
  private readonly API_URL = `${environment.apiUrl}/api/comptes`;

  constructor(private http: HttpClient) {}

  getComptes(page: number = 0, size: number = 10): Observable<PageableCompte> {
    return this.http.get<PageableCompte>(`${this.API_URL}?page=${page}&size=${size}`);
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
}
