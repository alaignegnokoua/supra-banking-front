import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CompteService, CompteRequest } from '../services/compte.service';

@Component({
  selector: 'app-compte-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './compte-form.component.html',
  styleUrls: ['./compte-form.component.scss']
})
export class CompteFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  isEdit = false;
  compteId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private compteService: CompteService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      numero: ['', [Validators.required, Validators.minLength(10)]],
      type: ['CHECKING', Validators.required],
      devise: ['EUR', Validators.required]
    });
  }

  ngOnInit(): void {
    this.compteId = this.route.snapshot.paramMap.get('id') ? +this.route.snapshot.paramMap.get('id')! : null;
    if (this.compteId) {
      this.isEdit = true;
      this.loadCompte();
    }
  }

  loadCompte(): void {
    if (!this.compteId) return;
    this.compteService.getCompte(this.compteId).subscribe({
      next: (compte) => {
        this.form.patchValue(compte);
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du compte';
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;

    const request: CompteRequest = this.form.value;

    const operation = this.isEdit && this.compteId
      ? this.compteService.updateCompte(this.compteId, request)
      : this.compteService.createCompte(request);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/comptes']);
      },
      error: (err) => {
        this.error = 'Erreur lors de la sauvegarde';
        this.loading = false;
      }
    });
  }
}
