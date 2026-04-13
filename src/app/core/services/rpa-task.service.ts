import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RpaTask {
  id: number;
  nomTache: string;
  type: string;
  statut: string;
  payload?: string;
  resultMessage?: string;
  lastError?: string;
  retryCount?: number;
  createdAt?: string;
  startedAt?: string;
  finishedAt?: string;
  dateExecution?: string;
  userId?: number;
  username?: string;
}

export interface CreateRpaTaskRequest {
  nomTache: string;
  type: string;
  payload?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RpaTaskService {
  private readonly API_URL = `${environment.apiUrl}/api/rpa-tasks`;

  constructor(private http: HttpClient) {}

  createMyTask(request: CreateRpaTaskRequest): Observable<RpaTask> {
    return this.http.post<RpaTask>(`${this.API_URL}/me`, request);
  }

  getMyTasks(): Observable<RpaTask[]> {
    return this.http.get<RpaTask[]>(`${this.API_URL}/me`);
  }

  cancelMyTask(taskId: number): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/me/${taskId}/cancel`, {});
  }

  getPendingTasks(): Observable<RpaTask[]> {
    return this.http.get<RpaTask[]>(`${this.API_URL}/pending`);
  }

  executeTaskNow(taskId: number): Observable<RpaTask> {
    return this.http.post<RpaTask>(`${this.API_URL}/admin/${taskId}/execute`, {});
  }

  executePendingTasksBatch(): Observable<number> {
    return this.http.post<number>(`${this.API_URL}/admin/execute-pending`, {});
  }
}
