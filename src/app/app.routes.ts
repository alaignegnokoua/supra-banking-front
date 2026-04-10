import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/pages/login.component';
import { RegisterComponent } from './features/auth/pages/register.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'comptes',
    canActivate: [authGuard],
    loadChildren: () => import('./features/comptes/comptes.module').then(m => m.ComptesModule)
  },
  { path: '**', redirectTo: '/dashboard' }
];
