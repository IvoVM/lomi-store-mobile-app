import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProducerPageRoutingModule } from './producer-routing.module';

import { ProducerPage } from './producer.page';
import { SharedModules } from '../../modules/shared.modules';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProducerPageRoutingModule,
    SharedModules
  ],
  declarations: [
    ProducerPage,
  ]
})
export class ProducerPageModule {}
