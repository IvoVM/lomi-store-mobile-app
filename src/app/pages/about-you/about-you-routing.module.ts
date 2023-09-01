import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AboutYouPage } from './about-you.page';

const routes: Routes = [
  {
    path: '',
    component: AboutYouPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AboutYouPageRoutingModule {}
