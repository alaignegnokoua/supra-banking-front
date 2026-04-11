import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  loading = false;
  success: string | null = null;
  error: string | null = null;
  passwordLoading = false;
  passwordSuccess: string | null = null;
  passwordError: string | null = null;

  readonly form = this.fb.nonNullable.group({
    nom: ['', [Validators.required, Validators.maxLength(100)]],
    prenom: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', [Validators.maxLength(30)]]
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        return;
      }

      this.form.patchValue({
        nom: user.clientNom ?? '',
        prenom: user.clientPrenom ?? '',
        email: user.clientEmail ?? user.email ?? '',
        telephone: user.clientTelephone ?? ''
      });
    });

    this.authService.loadCurrentUser();
  }

  submit(): void {
    this.success = null;
    this.error = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const value = this.form.getRawValue();

    this.authService.updateProfile({
      nom: value.nom.trim(),
      prenom: value.prenom.trim(),
      email: value.email.trim(),
      telephone: value.telephone?.trim() || undefined
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Profil mis à jour avec succès';
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Échec de mise à jour du profil';
      }
    });
  }

  submitPassword(): void {
    this.passwordSuccess = null;
    this.passwordError = null;

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const value = this.passwordForm.getRawValue();
    if (value.newPassword !== value.confirmPassword) {
      this.passwordError = 'La confirmation du mot de passe ne correspond pas';
      return;
    }

    this.passwordLoading = true;
    this.authService.changePassword({
      currentPassword: value.currentPassword,
      newPassword: value.newPassword
    }).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.passwordSuccess = 'Mot de passe modifié avec succès';
        this.passwordForm.reset();
      },
      error: (err) => {
        this.passwordLoading = false;
        this.passwordError = err?.error?.message || 'Échec de changement du mot de passe';
      }
    });
  }
}
