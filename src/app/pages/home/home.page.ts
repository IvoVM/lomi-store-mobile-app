import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CheckoutService } from '../../services/checkout.service';
import { CartService } from '../../services/cart.service';
import { ActionSheetController } from '@ionic/angular';
import { TaxonsServices } from 'src/app/services/taxons.services';
import { Platform  } from '@ionic/angular';
import { AppMinimize } from '@ionic-native/app-minimize';
import { LaunchDarklyService } from 'src/app/services/launch-darkly.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { SecurityProvider } from 'src/app/services/security.service';
import { OrderService } from 'src/app/services/order.service';
import { IntercomService } from 'src/app/services/intercom.service';
import { AddressService } from 'src/app/services/address.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  pendingOrders = []
  cartErrors;
  alert;
  errorSubscription;
  errorsFlag = false;
  loadedIndex = -1;
  repeatOrderFlag;
  trackDeliveryFlag;
  countOrders = 0;
  isLoggedIn

  private addresSubscription;
  public isGlobal = false;
  constructor(
              public actionSheetController: ActionSheetController,
              private router: Router,
              private cartService: CartService,
              private alertCtrl: AlertController,
              public taxonsService:TaxonsServices,
              private platform: Platform,
              private userEvents: UserEventsService,
              private toastCtrl: ToastController,
              private ldService: LaunchDarklyService,
              private securityProvider: SecurityProvider,
              private orderService: OrderService,
              private addressService: AddressService,
              private intercom: IntercomService
              ) {
                this.addresSubscription = addressService.activeAddress$.subscribe((address:any) => {
                  this.isGlobal = address.attributes?.global
                })
                  }

  async showToast(message, color = 'primary') {
    await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color, //danger
      buttons: [{
        text: 'OK',
        handler: () => {
          console.log("ok clicked");
        }
      }]
    }).then(res => {
      res.present()
    });
  }

  async ionViewWillEnter() {
    this.repeatOrderFlag =  await this.ldService.client.variation('repeat-order', false)
    this.trackDeliveryFlag =  await this.ldService.client.variation('track-delivery', false)
    this.checkCompletedOrder()
    this.orderService.orders({ page: 1, per_page: 12}).then(resp => {
      if(!resp) return 
      this.countOrders = resp.data.length
      if (this.countOrders == 0) return
      let orders = resp.data
      this.pendingOrders = orders
        .filter(o => o.attributes.shipment_state !== 'shipped')
        .filter(o => o.attributes.shipment_state !== 'canceled')
    })
  }

  ngOnInit() {
    this.securityProvider.isLoggedIn().subscribe(resp => {
      this.isLoggedIn = resp
      if (this.isLoggedIn) this.intercom.intercomStart()
    })
    SplashScreen.hide();
    this.platform.backButton.subscribeWithPriority(10, () => {
      if(this.router.url.includes('/tabs/home')){
        AppMinimize.minimize();
      }
    });
    window.analytics.page('home');
    this.userEvents.userEvents['home_screen.loaded'].track()
    this.taxonsService.fetchMoments();
  }

  loadRows(event){
    this.loadedIndex = Math.max(this.loadedIndex, parseInt((event.detail.scrollTop / 180).toString()) + 1)
  }

  ngOnDestroy() {
    if(this.errorSubscription){
      this.errorSubscription.unsubscribe();
    }
  }

  goToTaxon(taxonLink, taxonName = "Sin titulo") {
    this.router.navigate(['taxon', taxonLink], {
      queryParams: {
        taxonName
      }
    }).then();
  }

  async alertError() {
    this.alert = await this.alertCtrl.create({
      header: 'Ha ocurrido un error',
      message: this.cartErrors,
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.cartService.openCart();
            this.alert.dismiss();
            this.errorsFlag = false;
          }
        },
      ]
    });
    await this.alert.present();
  }

  goToOrders() {
    this.userEvents.userEvents['repeat_order.clicked'].track()
    this.router.navigateByUrl('/tabs/orders')
  }

  checkCompletedOrder(){
    return new Promise((resolve) => {
      let res = this.cartService.checkIfNotCompletedOrder()
      res.then(async (notCompletedOrder) => {
        let currentCart = await this.cartService.activeCart$.getValue();
        if (!notCompletedOrder && currentCart) {
          this.router.navigate(['/orders', currentCart.data.attributes.number], {
            replaceUrl: true,
            queryParams: {
              order_token: currentCart?.data.attributes.token
            }
          })
        }
        resolve(res);
      }).catch(err => {
        resolve(true);
      });
    })
  }
}
