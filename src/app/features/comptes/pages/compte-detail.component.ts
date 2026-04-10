import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CompteService, Compte } from '../services/compte.service';

@Component({
  selector: 'app-compte-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './compte-detail.component.html',
  styleUrls: ['./compte-detail.component.scss']
})
export class CompteDetailComponent implements OnInit {
  compte: Compte | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private compteService: CompteService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCompte(+id);
    }
  }

  loadCompte(id: number): void {
    this.compteService.getCompte(id).subscribe({
      next: (data) => {
        this.compte = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Compte non trouvé';
        this.loading = false;
      }
    });
  }
}
