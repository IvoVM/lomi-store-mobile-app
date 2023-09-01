import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TaxonPage } from './taxon.page';

const routes: Routes = [
  {
    path: '',
    component: TaxonPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TaxonPageRoutingModule {}
