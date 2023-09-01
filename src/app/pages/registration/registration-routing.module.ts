import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginPage } from '../login/login.page';

import { RegistrationPage } from './registration.page';

const routes: Routes = [
  {
    path: '',
    component: RegistrationPage
  },
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'registration-complete',
    loadChildren: () => import('./registration-complete/registration-complete.module').then( m => m.RegistrationCompletePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrationPageRoutingModule {}
