import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CheckoutKushkiPage } from './checkout-kushki.page';

const routes: Routes = [
  {
    path: '',
    component: CheckoutKushkiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckoutKushkiPageRoutingModule {}
