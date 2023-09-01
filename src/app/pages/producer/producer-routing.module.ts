import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProducerPage } from './producer.page';
import { IonicModule } from '@ionic/angular';

const routes: Routes = [
  {
    path: '',
    component: ProducerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), IonicModule],
  exports: [RouterModule],
})
export class ProducerPageRoutingModule {}
