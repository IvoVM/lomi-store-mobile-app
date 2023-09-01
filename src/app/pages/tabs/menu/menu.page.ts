import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ModalController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ModalFaqsComponent } from 'src/app/modals/account/faqs/modal-faqs.component';
import { ModalShipmentAvaibilityComponent } from 'src/app/modals/account/modal-shipment-avaibility/modal-shipment-avaibility.component';
import { ModalMyAccountComponent } from 'src/app/modals/account/my-account/modal-my-account.component';
import { ModalOrdersComponent } from 'src/app/modals/account/orders/modal-orders.component';
import { ModalPaymentMethodsComponent } from 'src/app/modals/account/payment-methods/modal-payment-methods.component';
import { ModalTermsComponent } from 'src/app/modals/account/terms/modal-terms.component';
import { FcmService } from 'src/app/services/fcm.service';
import { IntercomService } from 'src/app/services/intercom.service';
import { LaunchDarklyService } from 'src/app/services/launch-darkly.service';
import { SecurityProvider } from 'src/app/services/security.service';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { appVersionData } from 'src/app/app-version';
import { CartService } from 'src/app/services/cart.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { TaxonsServices } from 'src/app/services/taxons.services';
import { MyMilesLatamComponent } from 'src/app/modals/my-miles-latam/my-miles-latam.component';
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
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  public ModalTarget = ModalTarget
  userEmail = '';
  userName;
  userImage;
  wwwVersion = appVersionData.wwwVersionNumber;
  appVersion = appVersionData.versionName;
  deleteAccountFlag = false;
  primeExpiration = ''
  primeExpirationIn = 0
  isPrime = false

  constructor(
    private fcmService: FcmService,
    private securityProvider: SecurityProvider,
    private router: Router,
    private modalCtrl: ModalController,
    private iab: InAppBrowser,
    private intercom: IntercomService,
    private ldService: LaunchDarklyService,
    private userEventsService: UserEventsService,
    private nativeStorage: Storage,
    private cartService: CartService,
    private taxonsService: TaxonsServices,
  ) {
  }

  async goToProfile() {
    this.router.navigateByUrl('/tabs/profile').then()
  }

  ionViewWillEnter() {
    GoogleAuth.initialize();
    if (this.securityProvider.getUserData()) {
      let { data } = this.securityProvider.getUserData();
     this.isPrime = data.attributes.is_prime
      this.userEmail = data.attributes.email;
      this.userName = data.attributes.first_name
      if (this.isPrime) {
        this.primeExpiration = data.attributes.prime_expiration ? data.attributes.prime_expiration: ''
        this.primeExpirationIn = Math.floor((new Date(this.primeExpiration).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      } 
    }
    this.nativeStorage.get('googleImageUrl').then(resp => {
      this.userImage = resp
    })

    this.intercom.intercomStart()
  }

  async ngOnInit() {
    this.userEventsService.userEvents['menu.loaded'].track()
    this.deleteAccountFlag = await this.ldService.client.variation('delete-account', false)
  }

  deleteAccount() {
    let id = this.securityProvider.getUserData().data.id
    this.securityProvider.deleteUser(id).subscribe(() => {
      this.securityProvider.signOut()
      this.router.navigateByUrl("/home")
      this.cartService.showToast("Cuenta eliminada")
    }, () => {
      this.router.navigateByUrl("/home")
      this.cartService.showToast("Ocurrio un error")
    })
  }


  async goToOldProfile() {
    const modal = await this.modalCtrl.create({
      component: ModalMyAccountComponent,
      canDismiss: true,
      cssClass: 'modal-class'
    });
    await modal.present();
  }

  async goToAddresses() {
    this.router.navigateByUrl('/addresses').then()
  }

  async goToPaymentMethods() {
    this.router.navigateByUrl('/payment-methods').then()
  }

  async onLogout() {
    await this.nativeStorage.remove('googleImageUrl')
    await this.nativeStorage.remove('cartOrderToken')
    await this.fcmService.deleteDevice();
    await this.securityProvider.signOut();
    try {
      await GoogleAuth.signOut();
    } catch (e) {
    }
    this.cartService.setActiveCart(null)
    this.router.navigateByUrl('/tabs/user/login').then()
  }

  async onSelectedModalOpen(modalTarget: ModalTarget) {
    let target;
    switch (modalTarget) {
      case modalTarget = ModalTarget.ORDER:
        target = ModalOrdersComponent;
        this.userEventsService.userEvents['my_orders.clicked']
        break
      case modalTarget = ModalTarget.PAYMENTS:
        this.userEventsService.userEvents['payment_method.clicked']
        target = ModalPaymentMethodsComponent
        break
      case modalTarget = ModalTarget.MY_ACCOUNT:
        this.userEventsService.userEvents['profile.clicked'].track()
        target = ModalMyAccountComponent
        break
      case modalTarget = ModalTarget.ORDERS:
        this.userEventsService.userEvents['my_orders.clicked'].track()
        await this.router.navigate(['tabs', 'orders']);
        return
      case modalTarget = ModalTarget.FAQS:
        this.userEventsService.userEvents['faq.clicked'].track()
        target = ModalFaqsComponent
        break
      case modalTarget = ModalTarget.TERMS:
        this.userEventsService.userEvents['t_and_c.clicked'].track()
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

  async sendWhatsapp() {
    this.userEventsService.userEvents['customer_service.clicked'].track()
    const chatCondition = await this.ldService.client.variation('chat-customer', false);
    if (chatCondition) {
      this.intercom.show();
    } else {
      this.iab.create('https://wa.me/56942143971?text=Hola%21%20Lomi', '_system')
    }
  }

  goToLomiProviders() {
    this.iab.create('https://im9fnz0ooh0.typeform.com/to/f72r0fys', '_system')
  }

  async goToPrime() {
    let taxon = await this.taxonsService.getTaxon(1988);
    await this.router.navigate(['taxon/1988'], {
      queryParams: {
        taxonName: taxon.data.attributes.name
      }
    })

  }
  async openMilesLatamModal() {
    this.userEventsService.userEvents['my_miles_latam.clicked'].track()
    const modal = await this.modalCtrl.create({
      component: MyMilesLatamComponent,
      canDismiss: true,
      // breakpoints: [0.13],
      initialBreakpoint: 0.13
    });

    await modal.present();
  }

  
  goToLomiPuntos() {
    this.iab.create('https://lomi.cl/pages/lomipuntos', '_blank')
  }
}
