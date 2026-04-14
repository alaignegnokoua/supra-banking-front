import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  mfaStep = false;
  mfaMessage: string | null = null;
  resendMfaLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      mfaCode: ['']
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get mfaCode() {
    return this.loginForm.get('mfaCode');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const request: LoginRequest = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
      mfaCode: this.loginForm.value.mfaCode?.trim() || undefined
    };

    this.authService.login(request).subscribe({
      next: (response) => {
        if (response?.mfaRequired) {
          this.mfaStep = true;
          this.mfaMessage = response.mfaMessage || 'Code MFA requis';
          this.loading = false;
          return;
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Username, mot de passe ou code MFA incorrect';
        this.loading = false;
      }
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  resendMfaCode(): void {
    if (!this.username?.value || !this.password?.value) {
      this.error = 'Veuillez saisir username et mot de passe pour renvoyer le code MFA';
      return;
    }

    this.resendMfaLoading = true;
    this.error = null;

    this.authService.login({
      username: this.username.value,
      password: this.password.value
    }).subscribe({
      next: (response) => {
        this.mfaStep = !!response?.mfaRequired;
        this.mfaMessage = response?.mfaMessage || 'Nouveau code MFA envoyé';
        this.resendMfaLoading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Échec du renvoi du code MFA';
        this.resendMfaLoading = false;
      }
    });
  }
}
