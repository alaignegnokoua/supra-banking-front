import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TransactionListComponent } from './pages/transaction-list.component';

const routes: Routes = [
  { path: '', component: TransactionListComponent }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TransactionListComponent
  ]
})
export class TransactionsModule {}
