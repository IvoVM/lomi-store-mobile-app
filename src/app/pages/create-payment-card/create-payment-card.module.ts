import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreatePaymentCardPageRoutingModule } from './create-payment-card-routing.module';

import { CreatePaymentCardPage } from './create-payment-card.page';
import { SharedModules } from 'src/app/modules/shared.modules';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreatePaymentCardPageRoutingModule,
    SharedModules
  ],
  declarations: [CreatePaymentCardPage]
})
export class CreatePaymentCardPageModule {}
