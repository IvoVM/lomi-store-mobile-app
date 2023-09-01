import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddressesPage } from './addresses.page';

const routes: Routes = [
  {
    path: '',
    component: AddressesPage
  },
  {
    path: 'create-address',
    loadChildren: () => import('./create-address/create-address.module').then( m => m.CreateAddressPageModule)
  },
  {
    path: 'confirm-address',
    loadChildren: () => import('./confirm-address/confirm-address.module').then( m => m.ConfirmAddressPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddressesPageRoutingModule {}
