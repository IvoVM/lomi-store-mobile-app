import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewPaymentCardPageRoutingModule } from './new-payment-card-routing.module';

import { NewPaymentCardPage } from './new-payment-card.page';
import { SharedModules } from 'src/app/modules/shared.modules';
import { TestotpComponent } from './testotp/testotp.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewPaymentCardPageRoutingModule, 
    ReactiveFormsModule,
    SharedModules
  ],
  declarations: [NewPaymentCardPage, TestotpComponent]
})
export class NewPaymentCardPageModule {}
