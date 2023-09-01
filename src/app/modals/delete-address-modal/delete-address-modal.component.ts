import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { AddressService } from 'src/app/services/address.service';

@Component({
  selector: 'app-delete-address-modal',
  templateUrl: './delete-address-modal.component.html',
  styleUrls: ['./delete-address-modal.component.scss'],
})
export class DeleteAddressModalComponent implements OnInit {

  @Input() addressId;

  constructor(
    private modalCtrl: ModalController,
    private addressService: AddressService,
    private router: Router,
    private navController: NavController
  ) { }

  ngOnInit() {}

   confirm(){
    this.addressService.removeAddress(this.addressId).then(() => {
      if (this.router.url.includes('addresses/create-address')) {
        this.navController.back()
      }
      this.modalCtrl.dismiss()
    })
  }
  cancel(){
    this.modalCtrl.dismiss()
  }
}
