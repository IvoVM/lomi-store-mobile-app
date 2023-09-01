import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProducersPage } from './producers.page';
import { IonicModule } from '@ionic/angular';

const routes: Routes = [
  {
    path: '',
    component: ProducersPage
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes), IonicModule],
  exports: [RouterModule],
})
export class ProducersPageRoutingModule {}
