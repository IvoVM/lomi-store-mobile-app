import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProducersPageRoutingModule } from './producers-routing.module';

import { ProducersPage } from './producers.page';
import { SharedModules } from '../../modules/shared.modules';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProducersPageRoutingModule,
    SharedModules
  ],
  declarations: [
    ProducersPage
  ]
})
export class ProducersPageModule {}
