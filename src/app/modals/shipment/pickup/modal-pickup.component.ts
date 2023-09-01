import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { Checkout } from '@spree/storefront-api-v2-sdk/types/endpoints';
import { CartService } from 'src/app/services/cart.service';
import { ModalsService } from 'src/app/services/modals.service';
import { AddressService } from '../../../services/address.service';

@Component({
  selector: 'app-modal-pickup',
  templateUrl: './modal-pickup.component.html',
  styleUrls: ['./modal-pickup.component.scss'],
})
export class ModalPickupComponent implements OnInit {
  addressesList;
  @Input() goBackOnDismiss = false;

  constructor(private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private modalsService: ModalsService,
    private cart: CartService,
    private routerService: Router,
    private navCtrl: NavController,
    private addressService: AddressService) {
    this.getGlobalAddresses();
  }

  ngOnInit() {
    console.log(this.goBackOnDismiss, "goBackOnDismiss")
  }

  async dismiss() {
    await this.modalCtrl.dismiss();
  }

  async onAddressSelected(address) {
    if (this.routerService.url.includes('checkout')) {
      this.modalsService.changeDirectionDialog().then((modal) => {
        modal.onDidDismiss().then((res) => {
          if (res.data) {
            this.addressService.setActiveAddress(address, 'pickup').then((res) => {
              this.showToast().then();
              this.dismiss()
              this.routerService.navigateByUrl("/cart")
            });
          }
        })
      })
    } else {
      this.addressService.setActiveAddress(address, 'pickup').then((res) => {
        this.dismiss().then();
        this.showToast().then();
      });
    }
  }

  async showToast() {
    await this.toastCtrl.create({
      message: "Dirección configurada",
      duration: 2000,
      position: 'bottom',
      color: 'primary',
      buttons: [{
        text: 'OK',
        handler: () => {
          console.log("ok clicked");
        }
      }]
    }).then(res => res.present());
  }

  getGlobalAddresses() {
    this.addressService.getGlobalAddresses()
      .then(response => response.json().then(json => {
        this.addressesList = json.data
        this.addressesList.forEach((element, index) => {
          if (element.attributes.lastname === "La Florida") {
            let address = element.attributes.address1.split(',')
            this.addressesList[index].attributes.address1 = address[0]
          }
        });
      }
      ))
      .catch(error => console.error('Error:', error))
  }

}
