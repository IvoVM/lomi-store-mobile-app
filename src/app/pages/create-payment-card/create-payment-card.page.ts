import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser/ngx';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { ICardSubscriptionData } from 'src/app/adapters/cardSubscriptionData';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { KushkiService } from 'src/app/services/kushki.service';
import { ModalsService } from 'src/app/services/modals.service';
import { OrderService } from 'src/app/services/order.service';
import { SecurityProvider } from 'src/app/services/security.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { environment } from 'src/environments/environment';



@Component({
  selector: 'app-create-payment-card',
  templateUrl: './create-payment-card.page.html',
  styleUrls: ['./create-payment-card.page.scss'],
})
export class CreatePaymentCardPage implements OnInit, OnDestroy {

  previousPage = '';
  card = [];
  titlePage = '';
  interval;
  orderId;
  containsAlcohol;
  cardsSubscription;
  subscriptionData: ICardSubscriptionData;
  subscribed;
  hideEdenred
  edenredMinTotal
  constructor(
    private navCtrl: NavController,
    private kushkiService: KushkiService,
    private router: Router,
    private security: SecurityProvider,
    private modalService: ModalsService,
    private userEventService: UserEventsService,
    private modalCtrl: ModalController,
    private iab: InAppBrowser,
    private checkoutService: CheckoutService,
    private cartService: CartService
  ) {
    this.containsAlcohol = this.cartService.getActiveCart().data.attributes.any_item_with_alcohol;
    this.hideEdenred = this.cartService.getActiveCart().data.attributes.hide_edenred_btn
    this.edenredMinTotal = this.cartService.getActiveCart().data.attributes.item_total
    this.previousPage = this.kushkiService.paymentMethodPage$.getValue()
    if (this.previousPage === 'checkout-kushki') { this.titlePage = 'Métodos de pago'}
    else this.titlePage = 'Registrar nueva tarjeta';
   }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getSubscription()
    this.cardsSubscription = this.kushkiService.getCards().subscribe(resp => {
      resp.forEach(element => {
        if (element.attributes.provider) this.card.push(element)
      });
    })
  }

  ngOnDestroy(): void {
    this.cardsSubscription.unsubscribe()
  }

  goBack(): void {
    this.navCtrl.navigateBack(`/${this.previousPage}`);
  }
  
  goToCredito() {
    this.navCtrl.navigateForward('/new-payment-card');
  }

  registerDebitCard() {
    this.modalService.openRedirectToWebpay().then(modal => {
      modal.onWillDismiss().then(resp => {
        if  (resp.data) {
          this.modalService.openProcesingData({title: 'Estamos redirigiendo a  Oneclick...',})
          let kushki = this.kushkiService.initKushki()
          kushki.requestSubscriptionCardAsyncToken({
            currency: 'CLP',
            email: this.security.getUserData().data.attributes.email,
            callbackUrl: environment.KUSHKI_CALLBACK_URL
          }, (response) => {
            if (!response.code) {
              console.log('###', response.token)
              this.kushkiService.registerDebitoCard(response.token).subscribe(resp => {
                this.modalCtrl.dismiss()
                this.showCardForm(resp['redirectUrl'])
              }, err => {
                this.modalCtrl.dismiss()
                this,this.modalService.openErrorMessageModal()
              })
            } else {
              this.modalCtrl.dismiss()
              this.modalService.openErrorMessageModal()
            }
          }, err => {
            this.modalCtrl.dismiss()
            this.modalService.openErrorMessageModal()
          });
        }
      })
    })

  }

  async selectOption(option: string, dataCard?) {
    if (option === 'sodexo' && this.containsAlcohol) return
    if (option === 'edenred' && this.containsAlcohol) return
    if (option === 'edenred' && this.edenredMinTotal < 1000 ) return
    this.userEventService.userEvents['payment_method.select'].track({
      payment_method: option
    })
    this.kushkiService.optionSelected$.next([option, dataCard])
    this.router.navigate([`/${this.previousPage}`]);
  }

  showCardForm(url) {
    const target = '_blank';
    const options = 'location=no,clearcache=yes,clearsessioncache=yes,hideurlbar=yes,zoom=no';

    
    const browser = this.iab.create(url, target, options);

    browser.on('loadstart').subscribe(
      (event) => {
        console.log('# EVENT', event)
        if (event.url === environment.KUSHKI_PAYMENT_METHOD) {
          browser.close();
          this.navCtrl.back();
        }
      },
      (error) => console.error(error)
    );

    browser.on('exit').subscribe(
      (event: InAppBrowserEvent) => console.log('# Event', event),
      (error) => console.error(error)
    );
  }

  getSubscription = () => { 
    this.security.getCardSubscriptionData().subscribe(
      (resp: ICardSubscriptionData) => {
        this.subscribed = resp.subscribed;
        this.subscriptionData = resp;
      },
      error => {
        this.subscribed = false;
      });
  }

}
