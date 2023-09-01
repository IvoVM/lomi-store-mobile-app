import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewPaymentCardPage } from './new-payment-card.page';

const routes: Routes = [
  {
    path: '',
    component: NewPaymentCardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewPaymentCardPageRoutingModule {}
