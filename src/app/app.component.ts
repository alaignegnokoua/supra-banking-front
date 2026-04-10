import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'SupraBanking';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Check if user is already authenticated on app init
    this.authService.loadCurrentUser();
  }
}
