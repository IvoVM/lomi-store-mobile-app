import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CheckoutKushkiPageRoutingModule } from './checkout-kushki-routing.module';

import { CheckoutKushkiPage } from './checkout-kushki.page';
import { SharedModules } from 'src/app/modules/shared.modules';
import { OrderDetailComponent } from '../checkout/order-detail/order-detail.component';
import { OrderDetailKushkiComponent } from './order-detail-kushki/order-detail-kushki.component';
import { ShipmentsCardComponent } from './shipments-card/shipments-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CheckoutKushkiPageRoutingModule,
    SharedModules
  ],
  declarations: [CheckoutKushkiPage, OrderDetailKushkiComponent, ShipmentsCardComponent]
})
export class CheckoutKushkiPageModule {}
