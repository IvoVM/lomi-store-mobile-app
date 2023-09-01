import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeaturedPage } from './featured.page';
import { IonicModule } from '@ionic/angular';

const routes: Routes = [
  {
    path: '',
    component: FeaturedPage,
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    IonicModule,
  ],
  exports: [RouterModule]
})
export class featuredPageRoutingModule {}
