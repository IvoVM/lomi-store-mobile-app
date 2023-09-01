import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaymentMethodsPageRoutingModule } from './payment-methods-routing.module';

import { PaymentMethodsPage } from './payment-methods.page';
import { PaymentMethodsCardComponent } from './payment-methods-card/payment-methods-card.component';
import { SharedModules } from 'src/app/modules/shared.modules';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PaymentMethodsPageRoutingModule,
    SharedModules
  ],
  declarations: [
    PaymentMethodsPage,
    PaymentMethodsCardComponent
  ]
})
export class PaymentMethodsPageModule {}
