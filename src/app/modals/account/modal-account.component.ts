import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalOrdersComponent } from './orders/modal-orders.component';
import { ModalPaymentMethodsComponent } from './payment-methods/modal-payment-methods.component';
import { ModalAddressesComponent } from './modal-addresses/modal-addresses.component';
import { ModalMyAccountComponent } from './my-account/modal-my-account.component';
import { ModalFaqsComponent } from './faqs/modal-faqs.component';
import { ModalTermsComponent } from './terms/modal-terms.component';
import { Router } from '@angular/router';
import { ModalShipmentAvaibilityComponent } from './modal-shipment-avaibility/modal-shipment-avaibility.component';
import { SecurityProvider } from 'src/app/services/security.service';
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser/ngx';
import { FcmService } from 'src/app/services/fcm.service';
import { IntercomService } from '../../services/intercom.service';
import { LaunchDarklyService } from '../../services/launch-darkly.service';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { appVersionData } from 'src/app/app-version';

export enum ModalTarget {
  ORDER,
  PAYMENTS,
  ADDRESSES,
  MY_ACCOUNT,
  FAQS,
  ORDERS,
  TERMS,
  SHIPMENT_AVAIBILITY
}

@Component({
  selector: 'app-modal-account',
  templateUrl: './modal-account.component.html',
  styleUrls: ['./modal-account.component.scss'],
})
export class ModalAccountComponent implements OnInit {
  public ModalTarget = ModalTarget
  user;
  appVersionNumber:any = appVersionData.versionNumber;
  appVersionCode:any = appVersionData.versionName;


  constructor(private modalCtrl: ModalController,
              private router: Router,
              public appVersion: AppVersion,
              private intercom: IntercomService,
              private ldService: LaunchDarklyService,
              private securityProvider: SecurityProvider,
              private iab:InAppBrowser,
              private fcmService: FcmService,
              ) {
    this.user = this.securityProvider.getUserData();
    GoogleAuth.initialize();
  }

  async ngOnInit() {
    this.appVersionCode = await this.appVersion.getVersionNumber()
  }

  async sendWhatsapp() {
    const chatCondition = await this.ldService.client.variation('chat-customer', false);
    if (chatCondition) {
      this.intercom.show();
    } else {
      this.iab.create('https://wa.me/56942143971?text=Hola%21%20Lomi', '_system')
    }
  }

  async dismiss() {
    await this.modalCtrl.dismiss();
  }

  async onSelectedModalOpen(modalTarget: ModalTarget) {
    let target;
    switch (modalTarget) {
      case modalTarget = ModalTarget.ORDER:
        target = ModalOrdersComponent
        break
      case modalTarget = ModalTarget.PAYMENTS:
        target = ModalPaymentMethodsComponent
        break
      case modalTarget = ModalTarget.ADDRESSES:
        target = ModalAddressesComponent
        break
      case modalTarget = ModalTarget.MY_ACCOUNT:
        target = ModalMyAccountComponent
        break
      case modalTarget = ModalTarget.ORDERS:
        this.dismiss();
        await this.router.navigate(['tabs', 'orders']);
        return
      case modalTarget = ModalTarget.FAQS:
        target = ModalFaqsComponent
        break
      case modalTarget = ModalTarget.TERMS:
        target = ModalTermsComponent
        break
      case modalTarget = ModalTarget.SHIPMENT_AVAIBILITY:
        target = ModalShipmentAvaibilityComponent
        break
    }
    const modal = await this.modalCtrl.create({
      component: target,
      canDismiss: true,
      cssClass: 'modal-class'
    });

    await modal.present();
  }
  async onLogout() {
    await this.fcmService.deleteDevice();
    await this.securityProvider.signOut();
    await GoogleAuth.signOut();
    this.dismiss();
    this.router.navigateByUrl('/tabs/user/login')
  }
}

