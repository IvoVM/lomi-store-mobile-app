import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { SecurityProvider } from '../../../services/security.service';
import { AddressService } from '../../../services/address.service';
import { ModalsService } from 'src/app/services/modals.service';
import { NavigationExtras, Router } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Component({
  selector: 'app-modal-delivery',
  templateUrl: './modal-delivery.component.html',
  styleUrls: ['./modal-delivery.component.scss'],
})
export class ModalDeliveryComponent implements OnInit {
  addressesList;
  logged;

  constructor(private modalCtrl: ModalController,
              private toastCtrl: ToastController,
              private modalsService: ModalsService,
              private userEventsService: UserEventsService,
              private routerService: Router,
              private cart: CartService,
              private navCtrl: NavController,
              private addressService: AddressService,
              private securityProvider: SecurityProvider,
              private router: Router) {



    this.addressService.addresses.subscribe(addresses => {
      this.addressesList = this.securityProvider.isLoggedIn().getValue() ? addresses : [];
    });

    this.securityProvider.sessionReady$.subscribe(session => {
      if (session) this.addressService.addressesList().then();
    });

    this.securityProvider.isLoggedIn().subscribe(logged => {
      this.logged = logged;
      if (logged) this.addressService.addressesList().then();
    });
  }

  ngOnInit() {
    this.userEventsService.userEvents['delivery_address.loaded'].track()
  }

  async dismiss() {
    await this.modalCtrl.dismiss();
  }

  onAddressSelected(address) {    
    this.userEventsService.userEvents['saved_location_address.clicked'].track()
    if(this.routerService.url.includes('checkout')){
      this.modalsService.changeDirectionDialog().then((modal)=>{
        modal.onDidDismiss().then((res)=>{
          if(res.data){
            this.addressService.setActiveAddress(address, 'delivery').then((res)=>{
              this.showToast().then();
              this.dismiss()
              this.routerService.navigateByUrl("/cart")
            });
          }
        })
      })
    } else {
      this.addressService.setActiveAddress(address, 'delivery').then((res)=>{
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

  async onCreateAddress(address = null) {
    this.userEventsService.userEvents['new_location_address.clicked'].track()
    this.modalCtrl.dismiss();
    let navigationExtras: NavigationExtras = {
      state: {
        titlePage: 'Crear Dirección',
        fromModal: true
      }
    }
    this.router.navigate(['addresses/create-address'], navigationExtras)
  }

}
