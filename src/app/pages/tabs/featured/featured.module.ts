import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeaturedPage } from './featured.page';
import { ExploreContainerComponentModule } from '../../../explore-container/explore-container.module';
import { featuredPageRoutingModule } from './featured-routing.module';
import { ModalShipmentComponent } from '../../../modals/shipment/modal-shipment.component';
import { SharedModules } from '../../../modules/shared.modules';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    featuredPageRoutingModule,
    SharedModules
  ],
  declarations: [
    FeaturedPage,
    ModalShipmentComponent,
  ]
})
export class FeaturedPageModule {}
