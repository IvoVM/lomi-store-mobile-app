import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CheckoutService } from '../../services/checkout.service';
import { NavigationExtras, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { SecurityProvider } from '../../services/security.service';
import { AlertController, ModalController, NavController, Platform } from '@ionic/angular';
import { ModalPaymentMethodsComponent } from '../../modals/account/payment-methods/modal-payment-methods.component';
import { AddressService } from '../../services/address.service';
import { Utils } from '../../../utils/util';
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser/ngx';
import { ModalsService } from 'src/app/services/modals.service';
import { CheckoutNoteComponent } from 'src/app/modals/checkout-note/checkout-note.component';
import { KushkiService } from 'src/app/services/kushki.service';
import { LaunchDarklyService } from 'src/app/services/launch-darkly.service';
import { environment } from 'src/environments/environment';
import { FcmService } from 'src/app/services/fcm.service';
import { DeliverySheduleComponent } from 'src/app/modals/delivery-shedule/delivery-shedule.component';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { Storage } from '@ionic/storage';
import { loadMercadoPago } from "@mercadopago/sdk-js";

import { scheduled } from 'rxjs';
import { SHIPMENT } from 'src/app/adapters/IShipment';
import { scheduledUtils } from 'src/utils/scheduled';
import { ShipmentScheduledService } from 'src/app/services/shipment-scheduled.service';
@Component({
  selector: 'app-checkout-kushki',
  templateUrl: './checkout-kushki.page.html',
  styleUrls: ['./checkout-kushki.page.scss'],
})
export class CheckoutKushkiPage implements OnInit {
  restartSubscription;
  cartSubscription;
  orderNumber;
  orderToken; env
  activeAddressId;
  specialInstructions = '';
  loading = true;
  cartReady = false;
  cart;
  cardSubscription: any = false;
  addressSubscription
  optionSelected
  completed = false;
  includesShipment = false
  paymentMetodData;
  edenredRedirectWeb
  customer = {
    name: "",
    phone: ""
  }
  orderId;
  progressBar;
  progressBarWidth;
  activeDrag = false
  progresBarValue = 110;
  interval;
  hourDelivery = {
    day: 'Hoy',
    hour: { id: 0, blok: 'Inmediata, en la proxima hora'}
  };
  //Feature flags
  banSodexo = false;
  loadMp = false;
  hideGreetingsPage = false;
  paymentButton;
  stockLocationId: number
  private lineItems
  shipments: any

  @ViewChild('customer') customerInput;
  @ViewChild('phone') phoneInput;

  shake(component) {
    try {
      document.getElementById(component).classList.add("shake")
      document.getElementById("aditional-info").scrollIntoView()
      setTimeout(() => {
        document.getElementById(component).classList.remove("shake")
      }, 500)
      document.getElementById(component).classList.add("error-input")
    } catch (e) {
      return e
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
    private shipmentScheduledService: ShipmentScheduledService,
    private cartService: CartService,
    private modalCtrl: ModalController,
    private ldService: LaunchDarklyService,
    private navCtrl: NavController,
    public addressService: AddressService,
    private securityProvider: SecurityProvider,
    private alertCtrl: AlertController,
    private iab: InAppBrowser,
    private router: Router,
    private userEventsService: UserEventsService,
    private alert: AlertController,
    private kushkiService: KushkiService,
    private fcmService: FcmService,
    private nativeStorage: Storage,
    private platform: Platform
  ) {
    this.getDefaultCard()
    this.kushkiService.optionSelected$.subscribe(resp => {
      this.optionSelected = resp[0]
      this.paymentMetodData = resp[1]
    })
  }

  async initMercadoPago() {
    this.loadMp = true
    const accessToken = await this.nativeStorage.get('accessToken')
    this.checkoutService.getMercadoPagoUser(accessToken).subscribe(async resp => 
      {
        await loadMercadoPago();
        const mp = new window.MercadoPago(environment.MP_PUBLIC_KEY, {
          locale: "es-CL",
        });
        const bricksBuilder = mp.bricks({ theme: 'bootstrap' });
        this.renderCardPaymentBrick(bricksBuilder, resp);
      }, err => {
        this.loadMp = false
        this.modalsService.openErrorMessageModal({ subTitle: 'No se pudo iniciar Mercadopago' })
      }
      )
  }

  async renderCardPaymentBrick(bricksBuilder, dataPayer) {
    let total = this.cart.display_total.replace('$', '').replace('.', '')
    const settings = {
      initialization: {
        amount: parseFloat(total),
        payer: {
          email: this.cart.email,
          customerId: dataPayer.customer_id,
          cardsIds: dataPayer.cards
        }
      },
      customization: {
        paymentMethods: {
          creditCard: 'all',
          debitCard: 'all',
        },
        visual: {
          hideFormTitle: true,
          hidePaymentButton: true,
          style: {
            customVariables: {
              baseColor: '#00c687',
              formPadding: 0
            },
          }
        }
      },
      binary_mode: true,
      statement_descriptor: "Lomi",
      callbacks: {
        onReady: () => {
          this.loadMp = false
        },
        onSubmit: ({ selectedPaymentMethod, formData }) => {
        },
        onError: (error) => {
          this.loadMp = false
          // this.modalsService.openErrorMessageModal({ subTitle: 'No se pudo iniciar Mercadopago' })
          // handle error
        }
      }

    }
    window.paymentBrickController = await bricksBuilder.create('payment', 'paymentBrick_container', settings)
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
    this.stockLocationId = await this.nativeStorage.get('stockLocations');
    this.banSodexo = await this.ldService.client.variation("sodexo-app-payment", false);
    this.hideGreetingsPage = await this.ldService.client.variation("hide-greetings-page-after-pay", false);
    this.edenredRedirectWeb = await this.ldService.client.variation("edenred-redirect-web", false);
    this.paymentButton = await this.ldService.client.variation('payment-button', false)
    console.log('### PAYMENT BUTTON', this.paymentButton)
    window.analytics.page('checkout');
    this.userEventsService.userEvents.checkoutStepViewed.track()
    this.getPaymentSubscription();
    this.addressSubscription = this.addressService.activeAddress.subscribe(async (activeAddress: any) => {
      this.includesShipment = false
      // this.loading = true;
      this.activeAddressId = activeAddress.id
    });
    if (!this.cartService.activeCart$.getValue() || this.cartService.activeCart$.getValue().data.attributes.state != 'payment') {
      this.navCtrl.back();
      setTimeout(() => {
        this.cartService.showToast("Hubo un error al procesar tu ordèn, lo sentimos.")
        this.cartService.openCart()
      }, 600)
    }

    this.cartService.loadingCart$.subscribe((loading) => {
      this.userEventsService.userEvents['loading.check'].track({
        ladoading: loading
      })
      this.loading = loading
    })


    this.cartSubscription = !this.cartSubscription ? this.cartService.getActiveCart$().subscribe(
      cart => {
        if (!cart) {
          return
        }
        this.cart = cart.data.attributes;
        let insuficientStockItems = []
        if (Utils.getIncluded(cart, 'line_item')) {
          this.lineItems = Utils.getIncluded(cart, 'line_item')
          const images = Utils.getIncluded(cart, 'image')
          const variants = Utils.getIncluded(cart, 'variant')
          const products = Utils.getIncluded(cart, 'product')
          products.forEach((product, index) => {
            products[index].data = { variant: [], images: []}
            const variant = variants.filter(v => v.id == product.relationships.variants.data[0].id)
            if (variant) products[index].data.variant = variant
            if (product.relationships.images.data.length > 0) {
              const image = images.filter(i => i.id == product.relationships.images.data[0].id)
              if (image) products[index].data.images = image
            }
          });
          this.shipments = Utils.getIncluded(cart, 'shipment')
          this.shipments.forEach((shipment, index) => {
            const filterProduct = products.filter(p => p.data.variant[0].attributes.available_for_stock_locations[0] == shipment.relationships.stock_location.data.id)
            this.shipments[index].products = filterProduct
            this.shipments[index].line_items = this.lineItems.filter(li => {
              return filterProduct.map(p => p.data.variant[0].id).includes(li.relationships.variant.data.id)
            })
          });
          for (var lineItem of Utils.getIncluded(cart, 'line_item')) {
            if (!lineItem.attributes.sufficient_stock) {
              insuficientStockItems.push(lineItem)
            }
          }

          if (insuficientStockItems.length && !this.modalsService.cartModal) {
            this.modalCtrl.getTop().then((top) => {
              if (!this.checkoutService.inTransition) {
                console.error("Insufficient stock", this.modalsService.cartModal)
                this.router.navigate(['cart']).then(() => this.modalsService.noStockDialog())
              }
            })
            return
          }
        }
      },

      error => {
        this.loading = false
      }) : this.cartSubscription;
    this.setDefaultHourDelivery();
  }

  ionViewWillEnter() {
    this.getOptSelected()
    if (this.optionSelected === 'mercadopago') this.initMercadoPago()
  }

  getPaymentSubscription() {
    this.securityProvider.isLoggedIn().subscribe((res) => {
      if (res) {

        this.cardSubscription = this.securityProvider.getCardSubscriptionData().subscribe(
          (resp: any) => {
            this.cardSubscription = resp ? resp : false
            this.optionSelected = resp && resp.subscribed ? "oldWebPay" : ""
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

  clear() {
    console.log("Destroying")
    this.cartSubscription.unsubscribe()
    this.addressSubscription.unsubscribe()

  }

  ngOnDestroy() {
    console.log("Destroying")
    this.cartSubscription.unsubscribe()
    this.addressSubscription.unsubscribe()
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

  setSheduleAt(scheduled): string {
    let sheduleAt;
    let date = new Date();
    let sheduleHour;
    let sheduleDay
    if (this.addressService.shipmentType === 'pickup') {
      return sheduleAt = ''
    }
    if (scheduled.hour.initialHour === -1) {
      return scheduled = ''
    } else {
      sheduleHour = scheduled.hour.blok.split('-')
      sheduleDay = scheduled.day
      let sumHour = parseInt(sheduleHour[0])
      if (scheduled.day === 'Hoy') {
        sheduleAt = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${sumHour}:00`
      } else if (scheduled.day === 'Mañana') {
        sheduleAt = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate() + 1} ${sumHour}:00`
      } else {
        const dataDay = sheduleDay.split('/')
        sheduleAt = `${dataDay[2]}-${dataDay[1]}-${dataDay[0]} ${sumHour}:00`

      }
    }
    return sheduleAt
  }

  async trackCompletedEvent() {
    const userData = this.securityProvider.getUserData().data
    const st = await this.nativeStorage.get('stockLocations');
    const productsPurchased = this.lineItems.map((product)=> {
      return { 
        name: product.attributes.name, 
        price: +product.attributes.price,
        product_id: product.relationships.variant.data.id ? +product.relationships.variant.data.id : +product.id,
        quantity: product.attributes.quantity,
        sku: product.attributes.sku
      }
    })
    this.userEventsService.userEvents.orderCompleted.track({
      coupon: this.cartService.promotionInfo?.code ? this.cartService.promotionInfo?.code : 0,
      currency: this.cart.currency,
      total_discount: +this.cart.promo_total,
      order_id: this.cart.number,
      products: productsPurchased,
      shipping_mode: this.addressService.shipmentType === 'pickup' ? 1 : 0,
      shipping: +this.cart.ship_total,
      tax: +this.cart.tax_total,
      total: +this.cart.pre_tax_item_amount,
      userId: userData.id ? +userData.id : 0,
      email: userData.attributes.email,
      device: this.platform.is('ios') ? 'iOS': 'Android',
      store: this.cart.stock_locations[0].name,
      stock_location_id: st
    });
  }

  async complete() {
    this.userEventsService.userEvents['transaction.clicked'].track({
      cartNumber: this.cart.number,
      stockLocationId: this.stockLocationId ? this.stockLocationId : 0
    });
    this.specialInstructions += " " + this.customer.phone + " " + this.customer.name
    if (this.specialInstructions) {
      this.checkoutService.orderUpdate({
        include: "payments",
        order: {
          special_instructions: this.specialInstructions
        }
      })
    }
    const shipmentScheduled = this.shipmentScheduledService.shipmentScheduled$.getValue()
    for (let scheduled of shipmentScheduled) {
      let shedule = this.setSheduleAt(scheduled.data)
      this.shipmentScheduledService.updateShipmentScheduled(scheduled.id, shedule).subscribe(resp => console.log('#####', resp))
    }

    this.completed = true;
    this.loading = true;
    this.cartService.getActiveCart$().subscribe(resp => this.orderId = resp.data.id);
    let opts = this.kushkiService.optionSelected$.getValue();
    console.log(opts)
    if (opts[0] && opts[0] == 'edenred') {
      this.payWithEdenred()
    }
    else if (opts[0] && opts[0] == 'mercadopago') {
      this.payWithMercadoPago()
    }
    else if (opts[0] && opts[0] === 'webpay') {
      this.payWithWebPay()
    } else if (!opts[0] || opts[0] === 'oldWebPay') {
      this.payOldWebPay()
    } else {
      this.payWithCreditDebit(opts)
    }

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


  async openNoteModal() {
    const modal = await this.modalCtrl.create({
      component: CheckoutNoteComponent,
      canDismiss: true,
      cssClass: 'checkout-note',
      componentProps: {
        nota: this.specialInstructions
      }
    })
    await modal.present();
    let { data } = await modal.onWillDismiss()
    this.specialInstructions = data
  }

  selectPaymentMethod() {
    this.activeDrag = false
    this.kushkiService.paymentMethodPage$.next('checkout-kushki')
    this.router.navigate(['/create-payment-card'])
  }

  getOptSelected() {
    let opts = this.kushkiService.optionSelected$.getValue()
    return this.optionSelected = opts[0]
  }


  async payOldWebPay() {
    (await this.checkoutService.complete()).subscribe(
      async (resp: any) => {
        if (resp.success) {
          this.userEventsService.userEvents['transaction.success'].track({
            cartNumber: this.cart.number,
          });
          let modal: HTMLIonModalElement = await this.modalsService.confirmOrderCompletedModal();
          let completedCartValidation = await modal.onDidDismiss()
          if (completedCartValidation.data.orderCompleted) {
            this.trackCompletedEvent()
            console.log(this.cart, "cart")
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

  payWithCreditDebit(opts) {
    this.modalsService.openProcesingData({ title: 'Ya casi terminamos', subTitle: 'Estamos procesando tu pago...' })
    let kushki = this.kushkiService.initKushki()
    kushki.requestDeviceToken({
      subscriptionId: opts[1].attributes.subscription_id
    }, async (response) => {
      let compelteOrder = await this.checkoutService.completeOrder(opts[1], this.orderId, response.token)
      if (compelteOrder.isSuccess()) {
        this.userEventsService.userEvents['kushki_confirmation.loaded'].track()
        this.modalCtrl.dismiss();
        this.goToGreetings()
        this.trackCompletedEvent()
      } else {
        this.userEventsService.userEvents['transaction_error_kushki.loaded'].track({
          message: compelteOrder.fail()
        })
        this.modalCtrl.dismiss();
        this.modalsService.openErrorMessageModal();
        this.loading = false;
        console.log(compelteOrder.fail())
        this.cartService.showToast(compelteOrder.fail())
      }
    }, err => {
      this.userEventsService.userEvents['transaction_error_kushki.loaded'].track({
        message: err
      })
      this.modalCtrl.dismiss();
      this.modalsService.openErrorMessageModal();
    })
  }

  payWithWebPay() {
    this.loading = false;
    let total = this.cart.display_total.replace('$', '').replace('.', '')
    this.modalsService.openProcesingData({ title: 'Ya casi terminamos', subTitle: 'Estamos procesando tu pago...' })
    let kushki = this.kushkiService.initKushki()
    kushki.requestCardAsyncToken({
      totalAmount: parseFloat(total),
      currency: 'CLP',
      email: this.securityProvider.getUserData().data.attributes.email,
      returnUrl: environment.KUSHKI_RETURN_URL,
      description: `Payment for Order ID: ${this.orderId}`
    }, (response) => {
      if (!response.code) {
        this.checkoutService.completeOrderWebPay(response.token, this.cart.number, this.orderId).then(resp => {
          if (resp.isSuccess()) {
            this.modalCtrl.dismiss()
            this.openPaymentKushki(resp.success())
            console.log(resp.success())
            this.trackCompletedEvent()
          } else {
            this.modalCtrl.dismiss()
            this.modalsService.openErrorMessageModal()
          }
        }, err => {
          this.modalCtrl.dismiss()
          this.modalsService.openErrorMessageModal()
        })

      } else {
        this.modalCtrl.dismiss()
        this.modalsService.openErrorMessageModal()
      }
    }, err => {
      this.modalCtrl.dismiss();
      this.modalsService.openErrorMessageModal();
    });
  }

  async payWithEdenred() {
    this.loading = false;
    if (this.edenredRedirectWeb) {
      this.goToSodexo()
    } else {
      let response = await this.checkoutService.getPaymentMethods()
      if (response.isSuccess()) {
        const { data } = response.success()
        let edenredData = data.filter(d => d.id == 45)
        this.openEdenredLogin(edenredData[0].attributes.login_url)
      }
    }
  }

  async payWithMercadoPago() {
    this.loading = false;
    const mpData = await window.paymentBrickController.getFormData()
    if (!mpData.formData) return this.cartService.showToast('Complete el fomulario de mercadopago')
    let mpFormData = mpData.formData
    this.modalsService.openProcesingData({ title: 'Ya casi terminamos', subTitle: 'Estamos procesando tu pago...' })
    const mercadopagoResponse = await this.checkoutService.completeOrderMeercadoPago(mpFormData)
    if (mercadopagoResponse.isFail()) {
      this.modalCtrl.dismiss();
      this.userEventsService.userEvents['transaction_error_edenred.loaded'].track({
        message: mercadopagoResponse.fail()? mercadopagoResponse.fail() : 'no code'
      })
      this.modalsService.openErrorMessageModal();
    } else {
      this.modalCtrl.dismiss();
      this.goToGreetings()
      this.trackCompletedEvent()
    }
  }


  activateDrage() {
    this.activeDrag = true
  }

  openEdenredLogin(url) {
    const target = '_blank';
    const options = 'location=no,clearcache=yes,clearsessioncache=yes,hideurlbar=yes,zoom=no';


    const browser = this.iab.create(url, target, options);


    browser.on('loadstart').subscribe(
      async (event) => {

        if (event.url.includes(environment.host + 'edenred/login?code')) {
          let a = event.url.split('=')
          let b = a[1].split('&')
          let code = b[0]
          if (!code) {
            this.userEventsService.userEvents['transaction_error_edenred.loaded'].track({
              message: 'no code'
            })
            this.modalsService.openErrorMessageModal()
          }
          this.validateEdenredPayment(code)
          browser.close()

        }

      },
      (error) => this.modalsService.openErrorMessageModal({ subTitle: error })

    );

    browser.on('exit').subscribe(
      (event: InAppBrowserEvent) => console.log('# E existe', event),
      (error) => console.error(error)
    );
  }

  openPaymentKushki(url) {
    const target = '_blank';
    const options = 'location=no,clearcache=yes,clearsessioncache=yes,hideurlbar=yes,zoom=no';


    const browser = this.iab.create(url, target, options);

    browser.on('loadstart').subscribe(
      (event) => {
        if (event.url.includes(environment.KUSHKI_RETURN_URL)) {
          let url = event.url.split('=')
          let token = url[1]
          this.validateWebPayment(token)
          browser.close();
        }
      },
      (error) => console.error(error)
    );

    browser.on('exit').subscribe(
      (event: InAppBrowserEvent) => console.log('# Event', event),
      (error) => console.error(error)
    );
  }

  async validateEdenredPayment(code) {
    await this.modalsService.openProcesingData({ title: 'Estamos validando tu pago...' });
    (await this.checkoutService.ValidatePaymentEdenred(code)).subscribe(async (resp) => {
      if (resp['success']) {
        this.trackCompletedEvent()
        this.userEventsService.userEvents['edenred_confirmation.loaded'].track()
        await this.modalsService.dismissTopModal()
        this.goToGreetings()
      } else {
        this.userEventsService.userEvents['transaction_error_edenred.loaded'].track({
          message: resp['message']
        })
        this.modalsService.dismissTopModal()
        this.modalsService.openErrorMessageModal({ subTitle: resp['message'] })
      }
    }, (err) => {
      this.userEventsService.userEvents['transaction_error_edenred.loaded'].track({
        message: err
      })
      this.modalsService.dismissTopModal()
      this.modalsService.openErrorMessageModal({ subTitle: err })
    })
  }

  validateWebPayment(token) {
    this.modalsService.openProcesingData({ title: 'Estamos validando tu pago...' })
    this.kushkiService.getTransactionStatus(token).subscribe(resp => {
      if (resp['status'] === 'approvedTransaction') {
        this.checkoutService.nextWebPayOrder().then(resp => {
          this.modalCtrl.dismiss()
          this.goToGreetings()
        })
      } else {
        this.modalCtrl.dismiss()
        this.modalsService.openErrorMessageModal()
      }
    })
  }

  getDefaultCard() {

    this.kushkiService.getCards().subscribe(resp => {
      console.log('resp', resp)
      resp.forEach(element => {
        if (element.attributes.default && element.attributes.provider) {
          this.kushkiService.optionSelected$.next(['credito/debito', element])
          this.getOptSelected()
        }
      });
    })
  }

  startCounter(event) {
    this.progressBar = event.start
    this.progressBarWidth = event.width
    let count = 0;
    if (event.start) {
      this.interval = setInterval(() => {
        count += 0.1
        this.progresBarValue = ((count * 110) / 3);
        if (this.progresBarValue >= 115) clearInterval(this.interval)
      }, 100);
    } else {
      this.progresBarValue = 114
      count = 0;
      clearInterval(this.interval)
    }
  }

  goToGreetings() {
    this.router.navigate(['/greetings'], {
      queryParams: {
        token: this.cart.token,
        number: this.cart.number
      }
    }).then(() => {
      if (this.restartSubscription) {
        this.restartSubscription.unsubscribe();
      }
      if (this.cartSubscription) {
        this.cartSubscription.unsubscribe()
      }
    })
  }

  async openDeliveryShedule() {
    const st = await this.nativeStorage.get('stockLocations');
    const delivery = this.addressService.shipmentType
    const modal = await this.modalCtrl.create({
      component: DeliverySheduleComponent,
      canDismiss: true,
      cssClass: 'delivery-shedule',
      componentProps: {
        stockLocationId: st,
        shipmentType: delivery ? SHIPMENT.DELIVERY: SHIPMENT.PICKUP
      }
    })
    await modal.present();
    let { data } = await modal.onWillDismiss()
    if (data) {
      this.hourDelivery = data;
    }

  }

  async setDefaultHourDelivery(): Promise<void> {
    if (this.cart.scheduled_at) {
      let dateNow = new Date()
      let dateCart = new Date(this.cart.scheduled_at)
      let deliveryDay = dateCart.getDate() - dateNow.getDate()
      if (deliveryDay == 0) {
        this.hourDelivery.day = 'Hoy'
        this.hourDelivery.hour = { id: 1, blok: `${dateCart.getHours()}:00 - ${dateCart.getHours() + 2}:00`}
      } else if (deliveryDay == 1) {
        this.hourDelivery.day= 'Mañana'
        this.hourDelivery.hour = { id: 1, blok: `${dateCart.getHours()}:00 - ${dateCart.getHours() + 2}:00`}
      }
    } else {
      const st = await this.nativeStorage.get('stockLocations');
      const date = new Date()
      const currentDay = date.getDay()
      const tomorrowDay = currentDay == 6 ? 0: currentDay + 1
      this.addressService.getStockLocationschedule(st).subscribe((schedules) => {
        const todayScheduled = schedules.filter(scheduled => scheduled.day_code == currentDay)
        const responseUtils = scheduledUtils.getDeliveryDay(todayScheduled)
        if (responseUtils.deliveryDay == 'Hoy') {
          this.hourDelivery.day = responseUtils.deliveryDay
          this.hourDelivery.hour = responseUtils.deliveryHour
        } else if (responseUtils.deliveryDay == 'Mañana') {
          const tomorrowScheduled = schedules.filter(scheduled => scheduled.day_code == tomorrowDay)
          const startTomorrow = new Date(tomorrowScheduled[0].starts_at).getHours()
          this.hourDelivery.day = 'Mañana'
          this.hourDelivery.hour = { id: 2, blok: `${startTomorrow}:00 - ${startTomorrow + 2}:00` }
        } else {
          this.hourDelivery.day = ''
        }
      })
    }

  }
}


