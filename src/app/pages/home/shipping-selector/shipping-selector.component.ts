import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ModalShipmentComponent } from '../../../modals/shipment/modal-shipment.component';
import { ModalController, NavController } from '@ionic/angular';
import { SecurityProvider } from '../../../services/security.service';
import { AddressService } from '../../../services/address.service';
import { CartService } from '../../../services/cart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ModalsService } from 'src/app/services/modals.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { ModalAddressesComponent } from 'src/app/modals/account/modal-addresses/modal-addresses.component';
import { ModalDeliveryComponent } from 'src/app/modals/shipment/delivery/modal-delivery.component';
import { add } from 'lodash';
@Component({
  selector: 'app-shipping-selector',
  templateUrl: './shipping-selector.component.html',
  styleUrls: ['./shipping-selector.component.scss'],
})
export class ShippingSelectorComponent {
  public activeAddress:any;
  loadingCart;
  isCheckout;
  loadingAddress = true;
  modal;
  public variant = false;
  @Input() goBackOnDismiss = false;

  // get deliveryTime(){
  //   return this.addressService.globalAddresses?.data.find((globalAddress)=>globalAddress.stockLocationId == this.addressService.address.stockLocationId)?.attributes.note
  // }

  private activeAddress$:any;
  private addressLoading$:any;
  private loadingCart$:any


  constructor(private modalCtrl: ModalController,
              private securityProvider: SecurityProvider,
              private modalsService: ModalsService,
              private router: Router,
              private nativeStorage: Storage,
              private userEventsService: UserEventsService,
              public addressService: AddressService) {
    this.requestNewAddress();
  }

  async requestNewAddress() {
    let countySelected;
    if(this.securityProvider.isLoggedIn().getValue()){
      const userData:any = this.securityProvider.getUserData().data.attributes;
      countySelected = userData.county_id
    }
    if(!countySelected){
      countySelected = await this.nativeStorage.get("county_id");
    }
    if(!countySelected){
      this.modalsService.userLocationModal();
    }
  }

  async onDeliverySelected() {
    this.userEventsService.userEvents['delivery_address.clicked'].track()
    let loggedIn = await this.securityProvider.isLoggedIn().getValue()
    if(loggedIn){
      const modal = await this.modalCtrl.create({
        component: ModalDeliveryComponent,
        canDismiss: true,
        cssClass: 'modal-class'
      });
  
      await modal.present();
    } else {
      this.router.navigateByUrl('/login')
    }
  }


  async openModalShipment() {
    this.userEventsService.userEvents['address.clicked'].track()
    const modal = await this.modalCtrl.create({
      component: ModalShipmentComponent,
      cssClass: 'shipment-modal',
      backdropDismiss: true,
      componentProps: {
        goBackOnDismiss: this.goBackOnDismiss
      }
    });
    modal.onWillDismiss().then(() => {
      this.nativeStorage.set("addressSelected", new Date());
    })
    await modal.present();
    return modal
  }

  truncateAddress(address) {
    const max = this.isCheckout ? 80 : 60;
    return address.length >= max ? address.slice(0, max) + "..." : address;
  }
}
