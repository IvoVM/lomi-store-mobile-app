import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreatePaymentCardPage } from './create-payment-card.page';

const routes: Routes = [
  {
    path: '',
    component: CreatePaymentCardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreatePaymentCardPageRoutingModule {}
