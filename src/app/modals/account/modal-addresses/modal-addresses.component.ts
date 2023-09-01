import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { SecurityProvider } from '../../../services/security.service';
import { ModalCreateAddressComponent } from './modal-create-address/modal-create-address.component';
import { AddressService } from '../../../services/address.service';
import { Storage } from '@ionic/storage';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Component({
  selector: 'app-modal-addresses',
  templateUrl: './modal-addresses.component.html',
  styleUrls: ['./modal-addresses.component.scss'],
})
export class ModalAddressesComponent implements OnInit {
  addressesList;

  constructor(private modalCtrl: ModalController,
              private securityProvider: SecurityProvider,
              private nativeStorage: Storage,
              private navCtrl:NavController,
              private userEventsService: UserEventsService,
              private addressService: AddressService) {
    this.addressService.addressesList().then();
    this.addressService.addresses.subscribe(addresses => this.addressesList = addresses)
  }

  ngOnInit() {
  }

  async openCreate(address = null) {
    const modal = await this.modalCtrl.create({
      component: ModalCreateAddressComponent,
      canDismiss: true,
      cssClass: 'modal-class',
      componentProps: { address },
    });
    await modal.present();
  }

  async removeAddress(addressId) {
    this.userEventsService.userEvents['location_address.deleted'].track();
    const resp = await this.addressService.removeAddress(addressId);
    
  }

  async dismiss() {
    await this.modalCtrl.dismiss();
  }
}
