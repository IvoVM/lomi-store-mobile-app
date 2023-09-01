import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DiscoverPage } from './discover.page';

const routes: Routes = [
  {
    path: '',
    component: DiscoverPage
  },
  {
    path: 'lomibox',
    loadChildren: () => import('./lomibox/lomibox.module').then( m => m.LomiboxPageModule)
  },
  {
    path: 'recepies',
    loadChildren: () => import('./recepies/recepies.module').then( m => m.RecepiesPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DiscoverPageRoutingModule {}
