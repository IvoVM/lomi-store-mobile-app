import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfirmAddressPageRoutingModule } from './confirm-address-routing.module';

import { ConfirmAddressPage } from './confirm-address.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfirmAddressPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ConfirmAddressPage]
})
export class ConfirmAddressPageModule {}
