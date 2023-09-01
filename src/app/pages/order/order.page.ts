import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { ActivatedRoute } from '@angular/router';
import { Utils } from '../../../utils/util';
import { CartService } from '../../services/cart.service';
import { Checkout } from '@spree/storefront-api-v2-sdk/types/endpoints';
import { CheckoutService } from 'src/app/services/checkout.service';
import * as Sentry from "@sentry/angular";
import { ModalsService } from 'src/app/services/modals.service';
import { NavController, ToastController } from '@ionic/angular';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {
  orderId;
  orderToken;
  cart;
  user;
  address;
  justFinished = false;
  cartItems = [];
  variants = [];
  loadingCart = false;
  count = 0;
  noStockProduct = []
  hideRepeatOrder = false

  constructor(private orderService: OrderService,
              private cartService:CartService,
              private checkoutService: CheckoutService,
              private modalsService: ModalsService,
              private navCtrl: NavController,
              private toastCtrl: ToastController,
              private modalService: ModalsService,
              private userEventsService: UserEventsService,
              private route: ActivatedRoute) {
  }

  getOrderState(state) {
    switch (state) {
      case 'complete':
        return 'Completado'
      default:
        return state
    }
  }

  get shipment(){
    return this.cart && Utils.getIncluded(this.cart,"shipment").length ? Utils.getIncluded(this.cart,'shipment')[0].attributes : null
  }

  ngOnInit() {
    this.noStockProduct = []
    window.analytics.page('order');
    this.orderId = this.route.snapshot.params['id'];
    if(this.orderId==this.cartService.activeCart$.getValue().data.attributes.number){
      this.justFinished = true;
      this.cart = this.cartService.activeCart$.getValue();
      this.cart.data.attributes.state = "Validando pago"
      this.checkoutService.releaseCart()
    }
    this.orderToken = this.route.snapshot.queryParams.order_token;
    if (this.orderId && this.orderToken) {
      this.orderService.order(this.orderToken, this.orderId).then(resp => {
        if(resp.isSuccess()){
          this.cart = resp.success();
          if(this.cartService.activeCart$.getValue()?.data.attributes.number == this.cart.data.attributes.number){
            this.checkoutService.releaseCart()
          }
        } else if(resp.isFail() && this.justFinished) {
          this.modalsService.orderTimeoutModal();
          this.userEventsService.userEvents['modal_order_summary.load_fail'].track({
            cartNumber: this.cart.number,
          })
        }
        if(this.cart){
          this.getLineItems();
          this.getUser();
          this.getAddress();
        }
      });
    }
    this.cartService.getLoadingCart$().subscribe(loading => {
      if (this.count == 0) {
        this.loadingCart = false
      } else {
        this.loadingCart = loading;
      }
      this.count ++;
    });
  }

  ionViewWillEnter() {
    if (this.route.snapshot.queryParams.hide_repeat_order) {
      console.log('####', this.route.snapshot.queryParams.hide_repeat_order)
      this.hideRepeatOrder = true;
    } else {
      this.hideRepeatOrder = false;
    }
    console.log('####', this.hideRepeatOrder)
  }

  ngOnDestroy(){
  }

  getLineItems() {
    this.cartItems = Utils.getIncluded(this.cart, 'line_item');
    let cartIncluded = this.cart.included
    cartIncluded.forEach(element => {
      if(element.type == 'variant') {
        this.variants.push(element)
      }
    });
  }

  async repeatOrder() {
    this.userEventsService.userEvents['repeat_order.done'].track({
      cartNumber: this.orderId
    })
    try {
      let timeOut = 30;
      let count = 0;
      this.modalService.openProcesingData({title: 'Estamos agregando los productos al carrito...', subTitle: 'Esto puede tomar unos segundos'})
      let interval = setInterval(() => {
        count ++
        if (count >= timeOut) {
          this.modalService.dismissTopModal()
          clearInterval(interval)
          this.navCtrl.navigateForward('/cart').then(() => {
            this.modalService.openStockRepeatOrder()
          })
        }
      }, 1000);
      for (let x = 0; x < this.variants.length; x++) {
        let quantity;
        let product = this.cartItems.filter(c => c['relationships'].variant.data.id === this.variants[x].id)
        quantity = product[0].attributes.quantity
        for (let i = 0; i < quantity; i ++) {
          let response = await this.cartService.addItem(this.variants[x], 1, this.variants[x].attributes.options_text, true)
          if(JSON.stringify(response).includes('error')) {
            this.noStockProduct.push(product[0].attributes.name)
            break
          };
        }
        if(this.variants.length -1 == x ) {
          this.modalService.dismissTopModal()
          clearInterval(interval)
          this.navCtrl.navigateForward('/cart').then(() => {
            this.modalService.openStockRepeatOrder()
          })
        }
      };
    } catch (error) {
      this.showToast(error)
    }
  }
  getUser() {
    this.user = Utils.getIncluded(this.cart, 'user')[0];
  }

  getAddress() {
    this.address = Utils.getIncluded(this.cart, 'address')[0];
  }

  async showToast(message, color = 'danger') {
    await this.toastCtrl.create({
      message: message,
      duration: 5000,
      position: 'bottom',
      cssClass: 'toast-error',
      color: color,
      buttons: [{
        text: 'OK',
        handler: () => {
        }
      }]
    }).then(res => res.present());
  }
}
