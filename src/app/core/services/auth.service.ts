import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
  mfaCode?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  tokenType?: string;
  expiresIn?: number;
  username?: string;
  roles?: string[];
  mfaRequired?: boolean;
  mfaMessage?: string;
}

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
  roles: string[];
  clientId?: number;
  clientNom?: string;
  clientPrenom?: string;
  clientEmail?: string;
  clientTelephone?: string;
  notificationsInAppEnabled?: boolean;
  notificationsEmailEnabled?: boolean;
  notificationsSmsEnabled?: boolean;
  notificationsTelegramEnabled?: boolean;
  telegramChatId?: string;
  mfaEnabled?: boolean;
}

export interface UpdateProfileRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateNotificationPreferencesRequest {
  notificationsInAppEnabled: boolean;
  notificationsEmailEnabled: boolean;
  notificationsSmsEnabled: boolean;
  notificationsTelegramEnabled: boolean;
  telegramChatId?: string;
}

export interface UpdateMfaSettingsRequest {
  mfaEnabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api/auth`;
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  loadCurrentUser(): void {
    if (this.hasToken()) {
      this.http.get<CurrentUser>(`${this.API_URL}/me`)
        .pipe(
          tap(user => {
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);
          }),
          catchError(() => {
            this.logout();
            return of(null);
          })
        )
        .subscribe();
    }
  }

  updateProfile(request: UpdateProfileRequest): Observable<CurrentUser> {
    return this.http.put<CurrentUser>(`${this.API_URL}/me/profile`, request).pipe(
      tap((user) => this.currentUserSubject.next(user))
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/me/password`, request);
  }

  updateNotificationPreferences(request: UpdateNotificationPreferencesRequest): Observable<CurrentUser> {
    return this.http.put<CurrentUser>(`${this.API_URL}/me/preferences`, request).pipe(
      tap((user) => this.currentUserSubject.next(user))
    );
  }

  updateMfaSettings(request: UpdateMfaSettingsRequest): Observable<CurrentUser> {
    return this.http.put<CurrentUser>(`${this.API_URL}/me/mfa`, request).pipe(
      tap((user) => this.currentUserSubject.next(user))
    );
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  private handleAuthResponse(response: AuthResponse): void {
    if (!response?.token) {
      return;
    }

    localStorage.setItem('auth_token', response.token);
    this.isAuthenticatedSubject.next(true);
    this.loadCurrentUser();
  }

  isInRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles.includes(role) ?? false;
  }

  isAdmin(): boolean {
    return this.isInRole('ROLE_ADMIN');
  }

  isAgent(): boolean {
    return this.isInRole('ROLE_AGENT');
  }

  isClient(): boolean {
    return this.isInRole('ROLE_CLIENT');
  }
}
