import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LomiboxPage } from './lomibox.page';

const routes: Routes = [
  {
    path: '',
    component: LomiboxPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LomiboxPageRoutingModule {}
