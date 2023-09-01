import { IonicModule } from '@ionic/angular';
import { NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';
import { ModalAccountComponent } from '../../modals/account/modal-account.component';
import { ModalDeliveryComponent } from '../../modals/shipment/delivery/modal-delivery.component';
import { ModalOrdersComponent } from '../../modals/account/orders/modal-orders.component';
import { ModalPaymentMethodsComponent } from '../../modals/account/payment-methods/modal-payment-methods.component';
import { ModalAddressesComponent } from '../../modals/account/modal-addresses/modal-addresses.component';
import { ModalCreateAddressComponent } from '../../modals/account/modal-addresses/modal-create-address/modal-create-address.component';
import { ModalMyAccountComponent } from '../../modals/account/my-account/modal-my-account.component';
import { ModalFaqsComponent } from '../../modals/account/faqs/modal-faqs.component';
import { ModalTermsComponent } from '../../modals/account/terms/modal-terms.component';
import { BannerSlidesComponent } from './banner-slides/banner-slides.component';
import { SharedModules } from '../../modules/shared.modules';
import { ModalPickupComponent } from '../../modals/shipment/pickup/modal-pickup.component';
import { ModalLoginComponent } from '../../modals/login/modal-login.component';
import { ModalShipmentAvaibilityComponent } from 'src/app/modals/account/modal-shipment-avaibility/modal-shipment-avaibility.component';
import { MainCategoriesSlidesComponent } from './main-categories-slides/main-categories-slides.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HomePageRoutingModule,
    SharedModules,
    ReactiveFormsModule,
  ],
  declarations: [
    HomePage,
    ModalOrdersComponent,
    MainCategoriesSlidesComponent,
    ModalAccountComponent,
    ModalLoginComponent,
    ModalDeliveryComponent,
    ModalPickupComponent,
    ModalPaymentMethodsComponent,
    ModalAddressesComponent,
    ModalCreateAddressComponent,
    ModalMyAccountComponent,
    ModalFaqsComponent,
    ModalTermsComponent,
    ModalShipmentAvaibilityComponent,
  ],
})
export class HomePageModule {}
