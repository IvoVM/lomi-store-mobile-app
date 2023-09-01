import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistrationCompletePage } from './registration-complete.page';

const routes: Routes = [
  {
    path: '',
    component: RegistrationCompletePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrationCompletePageRoutingModule {}
