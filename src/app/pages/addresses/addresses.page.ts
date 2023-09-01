import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, NavController, ToastController } from '@ionic/angular';
import { AddressService } from 'src/app/services/address.service';
import { ModalsService } from 'src/app/services/modals.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Component({
  selector: 'app-addresses',
  templateUrl: './addresses.page.html',
  styleUrls: ['./addresses.page.scss'],
})
export class AddressesPage implements OnInit {
  @ViewChild(IonItemSliding) ionSliding: IonItemSliding;
  @ViewChild('openSlide', { static: false }) openSlide: ElementRef
  addressesList;
  editable = false;
  titleCreate = 'Crear Dirección';
  titleEdit = 'Editar dirección';
  buttonName = 'Editar';

  constructor(
    private addressService: AddressService,
    private navCtrl: NavController,
    private router: Router,
    private userEventsService: UserEventsService,
    private toastCtrl: ToastController,
    private modalService: ModalsService
  ) {
    this.addressService.addressesList().then();
    this.addressService.addresses.subscribe(addresses => this.addressesList = addresses)
   }

  ngOnInit() { }

  goBack(): void {
    this.navCtrl.navigateRoot('/tabs/menu');
  }

  editAddress(): boolean {
    if (!this.editable) {
      this.buttonName = 'Listo';
    } else {
      this.buttonName = 'Editar';
    }
    return this.editable = !this.editable;
  }

  createAddress(titlePage: string, address?: number): void {
    let navigationExtras: NavigationExtras = {
      state: {
        titlePage: titlePage,
        address: address
      }
    }
    this.router.navigate(['addresses/create-address'], navigationExtras)
  }

  async removeAddress(addressId) {
    await this.modalService.deleteAddress(addressId)
  }

  onAddressSelected(address) {    
    this.userEventsService.userEvents['saved_location_address.clicked'].track()
    this.addressService.setActiveAddress(address, 'delivery').then((res)=>{
      this.showToast("Dirección configurada", "primary").then();
    }, err => this.showToast(err, "danger").then());
  }

  async showToast(message: string, color: string) {
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

}
