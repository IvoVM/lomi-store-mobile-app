import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { ModalPickupComponent } from './pickup/modal-pickup.component';
import { ModalDeliveryComponent } from './delivery/modal-delivery.component';
import { ModalCreateAddressComponent } from '../account/modal-addresses/modal-create-address/modal-create-address.component';
import { SecurityProvider } from 'src/app/services/security.service';
import { Router } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal-shipment.component.html',
  styleUrls: ['./modal-shipment.component.scss'],
})
export class ModalShipmentComponent implements OnInit {

  @Input() goBackOnDismiss;

  constructor(
    private cartService:CartService,
    private navCtrl: NavController,
    private userEventsService: UserEventsService,
    private router:Router, private securityProvider:SecurityProvider, private modalCtrl: ModalController) {
  }

  ngOnInit() {
    console.log(this.goBackOnDismiss, "goBackOnDismiss")
  }

  async dismiss() {
    await this.modalCtrl.dismiss();
  }

  async onDeliverySelected() {
    this.userEventsService.userEvents['delivery_address.clicked'].track()
    let loggedIn = await this.securityProvider.isLoggedIn().getValue()
    await this.dismiss();
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

  async onPickupSelected() {
    this.userEventsService.userEvents['store_pickup.clicked'].track()
    await this.dismiss();
    const modal = await this.modalCtrl.create({
      component: ModalPickupComponent,
      canDismiss: true,
      cssClass: 'shipment-pickup',
      componentProps: {
        goBackOnDismiss: this.goBackOnDismiss
      }
    });

    await modal.present();
  }

    async onCreateAddress(address = null) {
    this.userEventsService.userEvents['location_address.saved'].track()
    const modal = await this.modalCtrl.create({
      component: ModalCreateAddressComponent,
      canDismiss: true,
      cssClass: 'shipment-modal',
      componentProps: { address },
    });
    await modal.present();
  }
}
