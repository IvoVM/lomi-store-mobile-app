import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CheckoutPageRoutingModule } from './checkout-routing.module';

import { CheckoutPage } from './checkout.page';
import { SharedModules } from '../../modules/shared.modules';
import { OrderDetailComponent } from './order-detail/order-detail.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CheckoutPageRoutingModule,
    SharedModules,
  ],
  declarations: [
    CheckoutPage,
    OrderDetailComponent
  ]
})
export class CheckoutPageModule {}
