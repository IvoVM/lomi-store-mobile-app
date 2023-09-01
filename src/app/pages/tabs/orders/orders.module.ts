import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersPage } from './orders.page';
import { ExploreContainerComponentModule } from '../../../explore-container/explore-container.module';
import { OrdersRoutingModule } from './orders-routing.module';
import { SharedModules } from '../../../modules/shared.modules';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    RouterModule.forChild([{ path: '', component: OrdersPage }]),
    OrdersRoutingModule,
    SharedModules,
  ],
  declarations: [
    OrdersPage
  ]
})
export class OrderPageModule {}
