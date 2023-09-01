import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CheckoutService } from '../../services/checkout.service';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { SecurityProvider } from '../../services/security.service';
import { AlertController, ModalController, NavController, Platform } from '@ionic/angular';
import { ModalPaymentMethodsComponent } from '../../modals/account/payment-methods/modal-payment-methods.component';
import { AddressService } from '../../services/address.service';
import { Utils } from '../../../utils/util';
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser/ngx';
import { ModalsService } from 'src/app/services/modals.service';
import { LaunchDarklyService } from 'src/app/services/launch-darkly.service';
import * as Sentry from '@sentry/angular'
import { Transaction } from '@sentry/types';
import { UserEventsService } from 'src/app/user-events/user-events.service';

let transaction:Transaction;

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit, OnDestroy {
  restartSubscription;
  cartSubscription;
  orderNumber;
  orderToken;
  activeAddressId;
  specialInstructions = "";
  loading = true;
  cartReady = false;
  cart;
  cardSubscription: any = false;
  addressSubscription
  optionSelected = ""
  completed = false;
  backed = false;
  includesShipment = false
  paymentSubscription;

  //Feature flags
  banSodexo = false;
  hideGreetingsPage = false;
  private lineItems

  customer = {
    name: "",
    phone: ""
  }

  @ViewChild('customer') customerInput;
  @ViewChild('phone') phoneInput;


  async trackCompletedEvent(){
    const userData = this.securityProvider.getUserData().data
    const productsPurchased = this.lineItems.map((product)=> {
      return { 
        name: product.attributes.name, 
        price: product.attributes.price,
        product_id: product.id,
        quantity: product.attributes.quantity, 
        sku: product.attributes.sku
      }
    }) 
    this.userEventsService.userEvents.orderCompleted.track({
      coupon: this.cartService.promotionInfo?.name ?? '',
      currency: this.cart.currency,
      total_discount: this.cart.promo_total,
      order_id: this.cart.number,
      products: productsPurchased,
      shipping_mode: this.addressService.shipmentType === 'pickup' ? 1 : 0,
      shipping: this.cart.ship_total,
      tax: this.cart.tax_total,
      total: this.cart.display_total,
      userId: userData.id ? +userData.id: 0,
      email: userData.attributes.email,
      device: this.platform.is('ios') ? 'iOS': 'Android',
      store: this.cart.stock_locations[0].name,
      stock_location_id: 0
    });
  }


  shake(component) {
    try{
      document.getElementById(component).classList.add("shake")
      document.getElementById("aditional-info").scrollIntoView()
      setTimeout(() => {
        document.getElementById(component).classList.remove("shake")
      }, 500)
      document.getElementById(component).classList.add("error-input")

    } catch(e){
      
    }
  }

  shakeIfNoInput() {
    if (!this.customer.name) {
      this.shake("nameInput")
    }
    if (!this.customer.phone) {
      this.shake("phoneInput")
    }
  }

  get withData() {
    return this.addressService.shipmentType != "pickup" || (this.customer.name && this.customer.phone)
  }

  goToSodexo() {
    this.iab.create('https://lomi.cl/cart', '_system')
  }

  constructor(private checkoutService: CheckoutService,
    private modalsService: ModalsService,
    private cartService: CartService,
    private modalCtrl: ModalController,
    public addressService: AddressService,
    private securityProvider: SecurityProvider,
    private alertCtrl: AlertController,
    private iab: InAppBrowser,
    private router: Router,
    private ldService:LaunchDarklyService,
    private userEventsService: UserEventsService,
    private navCtrl: NavController,
    private platform: Platform) {
  }

  

  detectCardType(number) {
    var re = {
      electron: /^(4026|417500|4405|4508|4844|4913|4917)\d+$/,
      maestro: /^(5018|5020|5038|5612|5893|6304|6759|6761|6762|6763|0604|6390)\d+$/,
      dankort: /^(5019)\d+$/,
      interpayment: /^(636)\d+$/,
      unionpay: /^(62|88)\d+$/,
      visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
      mastercard: /^5[1-5][0-9]{14}$/,
      amex: /^3[47][0-9]{13}$/,
      diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
      discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
      jcb: /^(?:2131|1800|35\d{3})\d{11}$/
    }

    for (var key in re) {
      if (re[key].test(number)) {
        return key
      }
    }
  }

  toCardDisplay(cardNumber) {
    let returnedNumber = ""
    for (var number in cardNumber) {
      returnedNumber += cardNumber[number]
      if (+number > 0 && +number % 4 == 3) {
        returnedNumber += " "
      }
    }
    return returnedNumber
  }

  get cardInfo() {
    if (this.cardSubscription) {
      let cardNumber = this.cardSubscription["oneclick_card_number"]
      return {
        cardNumber: this.toCardDisplay(cardNumber),
        cardType: this.detectCardType(cardNumber) ? this.detectCardType(cardNumber) : this.cardSubscription["oneclick_card_type"]
      }
    } else {
      return {}
    }
  }

  async ngOnInit() {
    this.banSodexo = await this.ldService.client.variation("sodexo-app-payment", false);
    this.hideGreetingsPage = await this.ldService.client.variation("hide-greetings-page-after-pay", false);
    window.analytics.page('checkout');
    this.userEventsService.userEvents.checkoutStepViewed.track()
    this.getPaymentSubscription();
    this.addressSubscription = this.addressService.activeAddress.subscribe(async (activeAddress: any) => {
      this.includesShipment = false
      this.loading = true;
      this.activeAddressId = activeAddress.id
    });
    if(!this.cartService.activeCart$.getValue() || this.cartService.activeCart$.getValue().data.attributes.state != 'payment'){
      this.navCtrl.pop();
      setTimeout(()=>{
        this.cartService.showToast("Hubo un error al procesar tu ordèn, lo sentimos.")
        this.cartService.openCart()
      },600)
    }

    this.cartService.loadingCart$.subscribe((loading)=>{
      console.log(loading)
      this.loading = loading
    })


    this.cartSubscription = !this.cartSubscription ? this.cartService.getActiveCart$().subscribe(
      cart => {
        if (!cart) {
          return
        }
        this.userEventsService.userEvents['cart.loaded'].track()
        this.cart = cart.data.attributes;
        let insuficientStockItems = [] 
        if (Utils.getIncluded(cart, 'line_item')) {
          this.lineItems = Utils.getIncluded(cart, 'line_item')
          for (var lineItem of Utils.getIncluded(cart, 'line_item')) {
            if (!lineItem.attributes.sufficient_stock) {
              insuficientStockItems.push(lineItem)
            }
          }
          
          if(insuficientStockItems.length && !this.modalsService.cartModal){
            this.modalCtrl.getTop().then((top)=>{
              if(!this.checkoutService.inTransition){
                console.error("Insufficient stock", this.modalsService.cartModal)
                this.router.navigate(['cart']).then(()=>this.modalsService.noStockDialog())
              } 
            })
            return
          }
        }
      },
        
      error => {
        this.loading = false
      }) : this.cartSubscription;
  }

  getPaymentSubscription() {
    this.paymentSubscription = this.securityProvider.isLoggedIn().subscribe((res) => {
      if (res) {

        this.cardSubscription = this.securityProvider.getCardSubscriptionData().subscribe(
          (resp: any) => {
            console.log('##',resp)
            this.cardSubscription = resp ? resp : false
            this.optionSelected = resp && resp.subscribed ? "oneclick" : ""
          },
          error => {
            this.optionSelected = "";
            this.cardSubscription = false;
          });
      } else {
        console.log("not logged in")
      }
    })
  }

  async restartCart(token = null) {
    console.log("restarting", token)
    const restartResponse = await this.checkoutService.restartCartState(token);
  }

  clear(){
    console.log("Destroying")
    this.restartSubscription.unsubscribe()
    this.cartSubscription.unsubscribe()
    this.addressSubscription.unsubscribe()


  }

  ngOnDestroy() {
    console.log("Destroying")
    if(!this.completed){
      //this.restartCart(this.cart.token);
    }
    //this.restartSubscription.unsubscribe()
    this.cartSubscription.unsubscribe()
    this.addressSubscription.unsubscribe()
    this.paymentSubscription.unsubscribe()

    console.log("unsusbscribed")
  }

  errorRedirect() {
    this.cartReady = false;
    console.error("No payment Method")
    this.optionSelected = ""
    return
    this.router.navigate(['/home'],
      { queryParams: { cart_error: true } }).then();
  }

  async subscribePaymentMethod() {
    const modal = await this.modalCtrl.create({
      component: ModalPaymentMethodsComponent,
      canDismiss: true,
      cssClass: 'modal-class'
    });

    await modal.present();
    modal.onDidDismiss().then(() => {
      setTimeout(() => {
        this.getPaymentSubscription();
      }, 1000)
      setTimeout(() => {
        this.getPaymentSubscription();
      }, 5000)
    })
  }

  async complete() {
    
    this.userEventsService.userEvents['transaction.clicked'].track({
      cartNumber: this.cart.number
    });

    this.specialInstructions += " " + this.customer.phone + " " + this.customer.name
    if (this.specialInstructions && this.specialInstructions != undefined) {
      this.checkoutService.orderUpdate({
        include: "payments",
        order: {
          special_instructions: this.specialInstructions
        }
      })
    }
    this.completed = true;
    this.loading = true;
    (await this.checkoutService.complete()).subscribe(
      async (resp: any) => {
        if (resp.success) {
          this.userEventsService.userEvents['transaction.success'].track({
            cartNumber: this.cart.number,
          });
          let modal: HTMLIonModalElement = await this.modalsService.confirmOrderCompletedModal();
          let completedCartValidation = await modal.onDidDismiss()
          if (completedCartValidation.data.orderCompleted ) {
            this.trackCompletedEvent()
            this.router.navigate(['/orders', this.cart.number],
              {
                replaceUrl: true,
                queryParams: {
                  order_token: this.cart.token,
                }
              }).then(() => {
              if (this.restartSubscription) {
                this.restartSubscription.unsubscribe();
              }
              if (this.cartSubscription) {
                this.cartSubscription.unsubscribe();
              }
              this.loading = false;
            });
          } else {
            this.router.navigate(['/orders', this.cart.number],
              {
                replaceUrl: true,
                queryParams: {
                  order_token: this.cart.token,
                }
              }).then(() => {
              if (this.restartSubscription) {
                this.restartSubscription.unsubscribe();
              }
              if (this.cartSubscription) {
                this.cartSubscription.unsubscribe();
              }
              this.loading = false;
            });
            this.modalsService.orderTimeoutModal();
            this.loading = false;
            this.completed = false;
          }
        } else {
          this.userEventsService.userEvents['transaction.failed'].track({
            cartNumber: this.cart.number,
          });
          this.loading = false;
          this.completed = false;
          console.log(resp.message[0].response_code, "resp failed")
          this.cartService.showToast(this.checkoutService.decodeResponseCode(resp.message[0].response_code));
          this.userEventsService.userEvents['transaction_error.loaded'].track({
            cartNumber: this.cart.number,
            transactionError: this.checkoutService.decodeResponseCode(resp.message[0].response_code),
            transactionErrorId: resp.message[0].response_code
          })
        }
      }, error => {
        this.completed = false;
        this.loading = false;
        this.alertError().then();
      })
  }

  async alertError(customMessage = "") {
    let alert = await this.alertCtrl.create({
      header: 'Ha ocurrido un error',
      message: customMessage ? customMessage : 'La transacción no se pudo llevar a cabo',
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            console.log("ok clicked");
          }
        },
      ]
    });
    await alert.present();
  }

  setInstructions(event) {
    this.specialInstructions = event.detail.value;
  }
}
