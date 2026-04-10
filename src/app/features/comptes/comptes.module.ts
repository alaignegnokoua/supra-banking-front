import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CompteListComponent } from './pages/compte-list.component';
import { CompteDetailComponent } from './pages/compte-detail.component';
import { CompteFormComponent } from './components/compte-form.component';

const routes: Routes = [
  { path: '', component: CompteListComponent },
  { path: 'new', component: CompteFormComponent },
  { path: ':id', component: CompteDetailComponent },
  { path: ':id/edit', component: CompteFormComponent }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CompteListComponent,
    CompteDetailComponent,
    CompteFormComponent
  ]
})
export class ComptesModule {}
