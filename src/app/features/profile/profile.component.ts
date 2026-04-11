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

  readonly form = this.fb.nonNullable.group({
    nom: ['', [Validators.required, Validators.maxLength(100)]],
    prenom: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', [Validators.maxLength(30)]]
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
}
