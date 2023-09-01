import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfirmAddressPage } from './confirm-address.page';

const routes: Routes = [
  {
    path: '',
    component: ConfirmAddressPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfirmAddressPageRoutingModule {}
