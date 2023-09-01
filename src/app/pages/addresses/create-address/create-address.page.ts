import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { ModalDeliveryComponent } from 'src/app/modals/shipment/delivery/modal-delivery.component';
import { AddressService } from 'src/app/services/address.service';
import { LaunchDarklyService } from 'src/app/services/launch-darkly.service';
import { ModalsService } from 'src/app/services/modals.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';


@Component({
  selector: 'app-create-address',
  templateUrl: './create-address.page.html',
  styleUrls: ['./create-address.page.scss'],
})
export class CreateAddressPage implements OnInit {
  address;
  titlePage = '';
  visibleIcon = false;
  submitted = false;
  fromModal = false;
  googlePlace;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private navCtrl: NavController,
    public formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private ldService: LaunchDarklyService
    ) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const { titlePage, address, fromModal } = this.router.getCurrentNavigation().extras.state;
        this.titlePage = titlePage;
        this.fromModal = fromModal
        this.address = address;
        this.visibleIcon = this.titlePage.includes('Editar')? true: false;
      }
    });
  }

  async ngOnInit() {
     this.googlePlace =  await this.ldService.client.variation('google-place', false)

  }

  async goBack() {
    if (this.fromModal) {
      const modal = await this.modalCtrl.create({
        component: ModalDeliveryComponent,
        canDismiss: true,
        cssClass: 'modal-class'
      });
      await modal.present()
    }
    await this.navCtrl.back();
  }


}
