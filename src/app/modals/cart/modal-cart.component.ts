import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Utils } from '../../../utils/util';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SecurityProvider } from '../../services/security.service';
import { ModalLoginComponent } from '../login/modal-login.component';
import { AnimationOptions } from 'ngx-lottie';
import { AddressService } from 'src/app/services/address.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { OrderService } from 'src/app/services/order.service';
import { ThisReceiver } from '@angular/compiler';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { ModalsService } from 'src/app/services/modals.service';
import { ProductsService } from 'src/app/services/products.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Promotions } from '@lomii/lomi-sdk'
import { PromotionsService } from 'src/app/services/promotions.service';
import { LaunchDarklyService } from 'src/app/services/launch-darkly.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Component({
  selector: 'app-modal-cart',
  templateUrl: './modal-cart.component.html',
  styleUrls: ['./modal-cart.component.scss'],
})
export class ModalCartComponent implements OnInit {
  @Input() lineItems;
  @Input() products;
  @Input() shipmentInfo;

  options: AnimationOptions = {
    path: 'https://assets9.lottiefiles.com/packages/lf20_ha1sw9v2.json',
  };

  expanded = null
  cart = this.cartService.activeCart$.getValue();
  loading = true;
  cartItems = [];
  discountForm: FormGroup;
  latamForm: FormGroup
  submitted = false;
  promotion;
  loadPromotion = true;
  discountError;
  deliveryErrors;
  validCart = false;
  loadingButton = false;
  cartSubscription;
  activeAddressId;
  updatingOrder = false;
  loadingPromotion = false;
  count = 0;
  public latamCode = null;
  translatedButton = false;
  isShipment = false;
  // FLAGS
  checkoutKushki;

  public get isDelivery() {
    return this.cart.included.find((element) => {
      return element.attributes.global == false
    })
  }

  getLineItemProduct(itemId) {
    if(this.lineItems) return this.products.find((item) => item.id == itemId)

    let products = Utils.getIncluded(this.cart, 'product')
    let product = products.find((product) => product.relationships.variants.data[0].id == itemId.relationships.variant.data.id)
    return product
  }


  constructor(private modalCtrl: ModalController,
              private router: Router,
              public formBuilder: FormBuilder,
              private navCtrl: NavController,
              private toastCtrl: ToastController,
              public addressService: AddressService,
              public checkout: CheckoutService,
              private userEventsService:UserEventsService,
              private http: HttpClient,
              private security: SecurityProvider,
              public cartService: CartService,
              public loadingController: LoadingController,
              public alertController: AlertController,
              private ref: ChangeDetectorRef,
              private modalsService: ModalsService,
              private ldService: LaunchDarklyService) {
    this.discountForm = this.formBuilder.group({
      coupon_code: ['', [Validators.required]]
    })
    this.latamForm = this.formBuilder.group({
      latam_code: ['', [Validators.required]]
    })


    this.checkoutKushki = ldService.client.variation('checkout-kushki', false)
  }

  setLatamCode() {
    this.latamCode = this.latamForm.value.latam_code
  }

  ngOnInit() {
    console.log(this.lineItems, this.shipmentInfo)
  }

  ionViewWillEnter() {
    if(this.lineItems){
      this.loading = false;
      this.cartItems = this.lineItems
      return
    }

    this.cartService.emptyCart = this.emptyCart.bind(this);
    this.cartService.loadingCart$.subscribe((loadingCart) => {
      if (this.count == 0) {
        this.updatingOrder = false
      } else {
        this.updatingOrder = loadingCart;
      }
      this.count ++;
    })
    this.checkout.inTransition = false;
    //this.cartService.setCart().then();
    //this.cartService.estimateShippingRates()
    this.loading = true;
    //this.loading = false;
    this.checkout.getErrors().subscribe(errors => {
      this.deliveryErrors = errors
    })
    this.cartSubscription = this.cartService.getActiveCart$().subscribe(async cart => {
      this.cart = cart;
      
      if (cart?.data.attributes.item_count <= 0) return
      let sameAdjustment = this.cart?.data.attributes.adjustment_total == cart?.data.attributes.adjustment_total;
      this.cart = cart;
      this.getLineItems();
      this.getPromotions();
      this.validCart = Utils.getIncluded(cart, 'line_item').some(item => !item.attributes.sufficient_stock);
      this.loading = false;
      if(this.promotionInfo && this.promotionInfo.code && !this.updatingOrder && this.cartService.markPromotionForUpdate){
        await this.cartService.reloadCouponSilently(this.promotionInfo.code)
        this.cart.markPromotionForUpdate = false;
      }
    });
    this.userEventsService.userEvents['cart.viewed'].track({
      checkout_id: this.cart.data.attributes.number,
      state: this.cart.data.attributes.state
    })
  }

  ngOnDestroy() {
    this.cartSubscription?.unsubscribe();
  }

  applyCouponCode() {
    this.submitted = true;
    if (!this.discountForm.valid) {
      return false;
    } else {
      this.cartService.applyCouponCode(this.discountForm.value).then(resp => {
        if (resp.isFail()) {
          this.discountError = resp.fail().summary;
          setTimeout(() => this.discountError = null, 5000);
        } else {
          this.promotion = {
            attributes: {
              name: this.discountForm.value.coupon_code
            }
          }
          this.showToast("Aplicado con éxito", 'primary').then();
        }
      });
    }
  }

  get promotionInfo() {
    return this.cart ? Utils.getIncluded(this.cart, 'promotion').filter(promotion=>promotion.attributes.code)[0]?.attributes : {}
  }

  removeCouponCode() {
    this.cartService.removeCouponCode(this.promotion.attributes.code).then(resp => {
      if (!resp.isFail()) {
        this.promotion = null;
        this.submitted = false;
        this.showToast("Eliminado con éxito", 'primary').then();
      }
    });
  }

  async dismiss() {
    let validCart: boolean = !(Utils.getIncluded(this.cart, 'line_item').find(item => !item.attributes.sufficient_stock));
    if (!validCart && this.router.url.includes('checkout')) {
      this.router.navigateByUrl('/tabs/home')
    }
    this.cartSubscription?.unsubscribe();
    await this.modalCtrl.dismiss();
  }

  async goToCheckout() {
    const upsellingActivated = await this.ldService.client.variation('upselling'  )
    if(upsellingActivated){
      await (await this.modalsService.upsellingModal()).onDidDismiss()
    }
    this.userEventsService.userEvents['checkout.clicked'].track()
    const code = this.promotionInfo ? this.promotionInfo.code : this.checkout.promotionInput;
    const cartAppliedCode = Utils.getIncluded(this.cart, 'promotion');
    if (!cartAppliedCode.length && code) {
      await this.cartService.applyCouponCode(code);
    }
    this.loadingButton = true;

    if (this.security.isLoggedIn$.getValue()) {
      let res = await this.checkout.calculateCosts();
      if (res) {
        this.cartService.showToast(res);
        this.loadingButton = false;
        this.cartService.loadingCart$.next(false);
        return
      }
      if (this.checkoutKushki) {
        this.router.navigate(['checkout-kushki']).then(() => this.dismiss());
      } else {
        this.router.navigate(['checkout']).then(() => this.dismiss());
      }
      this.loadingButton = false;
    } else {
      this.openLogin().then(()=>{
        this.loadingButton = false;
      });
    }
  }

  promotionModal(){
    this.userEventsService.userEvents['coupon.clicked'].track()
    this.modalsService.openDiscountModal();
  }

  translatePromoButton(event){
    this.translatedButton = event;
  }

  openProduct(line_item, event: Event) {
    this.modalsService.openProduct(this.getLineItemProduct(line_item), false)
    return
  }


  disableCheckout(noStock) {
    if (noStock) {
      this.deliveryErrors = [
        "No hay stock"
      ]
    }
  }

  getLineItems() {
    this.cartItems = Utils.getIncluded(this.cart, 'line_item');
    let productoNoQuantity = this.cartItems.filter(c => c.attributes.quantity == 0)
    productoNoQuantity.forEach(element => {
      if (element) {
        this.cartService.removeItem(element.relationships.variant.data, 0, element.attributes.options_text, true)
      }
    });
  }

  expandItem(expanded): void {
    this.expanded = this.expanded && this.expanded == expanded ? null : expanded;
  }

  cartEmpty() {
    return this.cart ? this.cart?.data.attributes.item_count === 0 : false;
  }

  get errorCtr() {
    return this.expanded == 'promotion' ? this.discountForm.controls : this.latamForm.controls;
  }

  async showToast(message, color) {
    await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
      buttons: [{
        text: 'OK',
        handler: () => {
          console.log("ok clicked");
        }
      }]
    }).then(res => res.present());
  }

  async openLogin() {
    const modal = await this.modalCtrl.create({
      component: ModalLoginComponent,
      canDismiss: true,
      cssClass: 'modal-class'
    });

    await modal.present();
  }

  get shipment() {
    let shipmentPromotions = this.cart.included.filter((included) => {
      return (included.type == 'promotion' && ['3'].includes(included.id))
    })
    let shipment = {
      promotions: [],
      delivery: true
    }
    if (shipment) {
      shipment.promotions = this.getPromotions().filter((promo) => {
        return !promo.attributes.code
      })
      if (shipment.promotions.find((promo) => {
        return promo.attributes.name.includes('Retiro') || promo.attributes.name.includes('retiro')
      })) {
        shipment.delivery = false
      }
      return shipment
    }
  }

  get promotions() {
    return this.getPromotions()
  }

  getPromotions() {
    if (this.cart?.data.relationships.promotions) {
      let promos = this.cart.data.relationships.promotions.data.map((promo) => {
        return promo.id
      })
      this.promotion = this.cart.included.find(promo => promo.type === 'promotion' && promo.attributes.code);
      return this.cart.included.filter(promo => promos.includes(promo.id));
    }
  }

  async emptyCart() {
    this.userEventsService.userEvents['cart.deleted'].track();
    const self = this;
    const alert = await this.alertController.create({
      header: 'Uy...',
      cssClass: 'messageAlert',
      message: '<center><span style="color: #424962">¿Estás seguro que quieres vaciar el carrito?</span></center>',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'cancelButtonAlert',
          handler: async () => {
            await alert.dismiss();
          }
        },
        {
          text: 'Vaciar carrito',
          cssClass: 'okButtonAlert',
          handler: async () => {
            await alert.dismiss();
            const loading = await this.loadingController.create({
              message: 'Estamos vaciando tu carrito...',
              //duration: 2000
            });
            loading.present().then(async (result) => {
              let res;
              const orderToken = await self.cartService.orderToken();
              const newHeaders = {};
              newHeaders['X-Spree-Order-Token'] = orderToken.orderToken || orderToken.bearerToken;
              let options = { 
                params: {
                  include : 'line_items,variants,variants.product.images,variants.images,billing_address,shipping_address,user,payments,shipments,promotions'
                },
                headers: new HttpHeaders(newHeaders) 
              }
              self.http.patch(`${ environment.host }/api/v2/storefront/cart/empty`, {}, options).subscribe(
                async (cart) => {
                  await self.cartService.setActiveCart(cart);
                  await self.cartService.showCart();
                  loading.dismiss();
                  self.ref.detectChanges();
                  this.navCtrl.pop()
                }, async () => {
                  await loading.dismiss();
                  const errorAlert = await self.alertController.create({
                    header: 'Uy...',
                    cssClass: 'messageAlert',
                    message: '<center><span style="color: #424962">No pudimos vaciar tu carrito</span></center>',
                    buttons: [
                      {
                        text: 'Ok',
                        handler: async () => {
                          await errorAlert.dismiss();
                        }
                      }]
                  })
                  await errorAlert.present();
                });
            });
          },
        },
      ],
    });

    alert.present();

    /*
    await loading.present().then(function(result){
      return Promise.all(arrayItems.map(function(item) {
          return self.cartService.addItem(item.variant, Number(item.line_item.quantity)*-1, item.variant.attributes.options_text)
      })).then(async function(response){
        await loading.dismiss();
        console.log("Carro vacío");
      });
    });
    */


  }
}
