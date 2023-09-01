import { ChangeDetectorRef, Injectable } from '@angular/core';
import { SecurityProvider } from './security.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { Storage } from '@ionic/storage';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Utils } from 'src/utils/util';
import * as Sentry from "@sentry/angular";
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
import { PromotionsService } from './promotions.service';
import * as _ from 'lodash';
import { ModalsService } from './modals.service';
import { UserEventsService } from '../user-events/user-events.service';

function diff(o1: any, o2: any): Partial<any> {
  return {
    ..._.omitBy(o1, (v, k) => o2[k] === v),
    ..._.omitBy(o2, (v, k) => o1[k] === v)
  };
}


@Injectable({
  providedIn: 'root'
})
export class CartService {
  public currentCart;
  public activeCart$ = new BehaviorSubject(null);
  public loadingCart$ = new BehaviorSubject(true);
  public openCart$ = new Subject();
  public stockLocations;
  public latamCode
  public when;
  public markPromotionForUpdate = false;
  public oldAdjustment;
  public reloadingPromotion = false;
  public lastCart: any;
  public cartLoaded = false;
  private dataInclude = 'line_items,variants,variants.product.images,variants.images,billing_address,shipping_address,user,payments,shipments,promotions'

  constructor(private securityProvider: SecurityProvider,
    private toastCtrl: ToastController,
    private http: HttpClient,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private router: Router,
    private navCtrl: NavController,
    private modalsService: ModalsService,
    private userEventsService: UserEventsService,
    private nativeStorage: Storage) {

    this.nativeStorage.create()
    
  }

  emptyCart() {
    //Setted from modal-cart component for now
    return;
  }

  openCart() {
    this.openCart$.next();
  }

  setStockLocations(st) {
    this.stockLocations = st;
  }

  getLoadingCart$() {
    return this.loadingCart$;
  }

  async estimateShippingRates() {
    let shippingRates = await this.securityProvider.getClient().checkout
    console.log(shippingRates)
  }

  public async orderToken() {
    const token = this.securityProvider.isLoggedIn().getValue()
      ? await this.nativeStorage.get('accessToken')
      : await this.nativeStorage.get('cartOrderToken');
    if(!token && this.securityProvider.isLoggedIn().getValue()){
      this.securityProvider.signOut(true);
      //TODO Friendly message
    }
    return this.securityProvider.isLoggedIn().getValue() ? { bearerToken: token } : { orderToken: token }
  }

  async redirectIfOrderIsCompleted(cart, searchRemote) {
    let is_completed = false
    if (searchRemote) {
      try {
        is_completed = await this.confirmOrderCompleted()
      } catch (e) {
        return
      }
    } else {
      if (cart && cart.data && cart.data.attributes.state) {
        is_completed = (cart.data.attributes.state == 'complete');
      }
    }

    if (is_completed) {
      this.goToOrder(cart);
      return true
    }

    return false
  }

  goToOrder(cart) {
    this.router.navigate(['/orders', cart.data.attributes.number],
      {
        queryParams: {
          order_token: cart.data.attributes.token,
          complete: true,
        }
      })
  }

  async confirmOrderCompleted(cartNumber = null) {
    cartNumber = cartNumber || this.activeCart$.getValue().data.attributes.number
    let res: any = await this.http.get(environment.host + 'api/v2/storefront/account/order_status?order_number=' + cartNumber).toPromise()
    if (res.message == "complete") {
      return true
    } else {
      return false
    }
  }

  async checkIfNotCompletedOrder() {
    // used in guard
    return !(await this.redirectIfOrderIsCompleted(this.currentCart, true))
  }


  async setActiveCart(cart) {
    this.userEventsService.userEvents['cart.loaded'].track()

    if (!cart) {
      this.activeCart$.next(cart);
      return
    }
    this.currentCart = cart;
    this.redirectIfOrderIsCompleted(this.currentCart, false);
    const cartNumber = cart.data.attributes.number;
    const cartNumbers = await this.nativeStorage.get('cartsToMerge');
    let numbers;
    if (cartNumbers) {
      numbers = cartNumbers.indexOf(cartNumber) === -1 ? [...cartNumbers, cartNumber] : cartNumbers;
    } else {
      numbers = [cartNumber];
    }
    if (!this.securityProvider.isLoggedIn().getValue()) {
      this.nativeStorage.set('cartsToMerge', numbers).then();
    } else {
      this.nativeStorage.remove('cartsToMerge').then();
    }
    this.nativeStorage.set('cartOrderToken', cart.data.attributes.token).then();
    if (cart.data.attributes.state == 'address' && !this.reloadingPromotion) {
      if (this.oldAdjustment && cart?.data.attributes.adjustment_total != this.oldAdjustment) {
        this.markPromotionForUpdate = true;
      }
      this.oldAdjustment = cart.data.attributes.adjustment_total
    }
    this.activeCart$.next(cart);
    return
  }

  getActiveCart$() {
    return this.activeCart$;
  }

  getActiveCart() {
    return this.activeCart$.getValue();
  }

  async updateOrderAddress(address) {
    let res;
    const orderToken = await this.orderToken();
    const newHeaders = {};
    newHeaders['X-Spree-Order-Token'] = orderToken.orderToken || orderToken.bearerToken;
    let options = { headers: new HttpHeaders(newHeaders) }
    res =  this.http.put(`${ environment.host }/api/v2/storefront/set_address`, {
      ship_address_id: address.id
    }, options)
    return res
  }

  async setCart() {
    const orderToken = await this.orderToken();
    const response = await this.securityProvider.getClient().cart.create(
      orderToken,
      {
        include: this.dataInclude,
        channel: "app",
      });
      if(response.success()){
      await this.setActiveCart(response.success());
    } else {
      this.showCart();
      return
    }

    this.loadingCart$.next(false);
  }

  async addItem(variant, quantity, optionText, extra?) {
    this.loadingCart$.next(true);
    const orderToken = await this.orderToken();
    let startDate = new Date().getTime()
    const responsePromise = this.securityProvider.getClient().cart.addItem(
      orderToken,
      {
        variant_id: variant.id,
        quantity,
        include: this.dataInclude
      }
    )
    const response = await responsePromise;
    if (response.isSuccess()) {
      let line_item = Utils.getIncluded(response.success(), 'line_item').find((line_item) => line_item.relationships.variant.data.id == variant.id)
      this.setActiveCart(response.success())
      this.loadingCart$.next(false);
    } else if(response.isFail()) {
      console.log(response.fail().name == 'NoResponseError')
      if((response.fail().name == 'NoResponseError')){
        this.modalsService.throwUnexpectedError()
      }
      //this.setActiveCart(response.fail()) Commented because is no reason for car updating
      if(response.fail().summary.includes('No hay stock')){
        this.showToast(response.fail().summary);
        console.log(variant)
        this.userEventsService.userEvents['error_product_stock.added'].track({
          variantId: variant.id,
          productId: variant.relationships.product.data.id,
        })
      }
      else if(response.fail().summary.includes('token.revoked')){
        this.securityProvider.signOut(true);
      }
      else if (response.fail().summary.includes('doorkeper')) {
        Sentry.captureMessage("Algo paso al agregar producto");
        this.mergeOrder()
      } else {
        this.showToast(response.fail().summary);
      }
      this.loadingCart$.next(false);
    }
    // this.showCart();
    return response.isSuccess() ? response.success() : response.fail()
  }


  async removeItem(variant, quantity, optionText, reloadCart = false) {
    this.loadingCart$.next(true);
    const cart = this.getActiveCart();
    const item = cart.included ? cart.included.find(el => (el.type === 'line_item' || el.relationships?.variant) && el.relationships.variant.data.id === variant.id && optionText === el.attributes.options_text) : null;
    if ((item && item.attributes.quantity + quantity === 0) || reloadCart) {
      const orderToken = await this.orderToken();
      let response = await this.securityProvider.getClient().cart.removeItem(
        orderToken,
        item.id,
        {
          include: this.dataInclude
        });
      if (response.isSuccess()) {
        this.setActiveCart(response.success())
        this.loadingCart$.next(false);
      } else {
        this.setActiveCart(response.fail())
        this.loadingCart$.next(false);
      }
      return
    }

    if (reloadCart) {
      await this.showCart();
      this.loadingCart$.next(false);
    }
  }

  async showCart(preventDeadlock = false) {
    const orderToken = await this.orderToken();
    const response = await this.securityProvider.getClient().cart.show(
      orderToken,
      {
        include: this.dataInclude
      });
    //* Supervise auth in wrong state
    if(response.isFail() && !preventDeadlock){
      if (response.fail().summary === 'No se pudo encontrar el recurso que estaba buscando.') {
        this.mergeOrder().then(data => 
          {
            if(data){
              data.subscribe(resp => {
                this.showCart();
              })
            } else {
            this.setCart()
          }
        });
      }
      else if(response.fail().summary.includes('token.revoked')){
        this.securityProvider.signOut(true);
      }
    }
    // End
    response.isSuccess()? await this.setActiveCart(response.success()) : '';
    return response
  }

  async applyCouponCode(data, showToast = true) {
    this.userEventsService.userEvents['coupon.applied'].track({
      coupon_code : data
    });
    if (!data) return
    this.loadingCart$.next(true);
    const orderToken = await this.orderToken();
    console.log(orderToken)

    if (!data.cupon_code) {
      data = {
        coupon_code: data,
        include: 'line_items,variants,variants.product.images,variants.images,billing_address,shipping_address,user,payments,shipments,promotions'
      }
    }
    const response = await this.securityProvider.getClient().cart.applyCouponCode(orderToken, data);
    if (!response.isFail()) {
      await this.setActiveCart(response.success())
      if (showToast) {
        this.showToast("Codigo promocional " + data.coupon_code + " aplicado", "primary")
        this.loadingCart$.next(false);
      }
    } else {
      if (showToast) {
        this.showToast(response.fail().summary)
        this.loadingCart$.next(false);
      }
    }
    return response;
  }

  get promotionInfo() {
    return this.activeCart$.getValue() ? Utils.getIncluded(this.activeCart$.getValue(), 'promotion').filter(promotion => promotion.attributes.code)[0]?.attributes : {}
  }

  async reloadCouponSilently(couponCode) {
    this.loadingCart$.next(true);
    await this.removeCouponCode(couponCode, false)
    await this.applyCouponCode(couponCode, false)
    this.markPromotionForUpdate = false;
    this.loadingCart$.next(false);
  }

  async removeCouponCode(coupon_code, showToast = true) {
    this.loadingCart$.next(true);
    const orderToken = await this.orderToken();
    const response = await this.securityProvider.getClient().cart.removeCouponCode(orderToken, coupon_code);
    if (!response.isFail()) {
      if (showToast) {
        this.showToast("Cupòn eliminado con exito", "primary")
        await this.showCart();
      }
    } else {
      if (showToast) {
        this.showToast("Hubo un error al eliminar el cupon")
      }
    }
    if (showToast) {
      this.loadingCart$.next(false);
    }
    return response;
  }

  async showToast(message, color = 'danger') {
    await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      cssClass: 'toast-error',
      color: color, //danger
      buttons: [{
        text: 'OK',
        handler: () => {
          console.log("ok clicked");
        }
      }]
    }).then(res => res.present());
  }

  async mergeOrder() {
    const cartNumbers = await this.nativeStorage.get('cartsToMerge');

    if(cartNumbers){
      console.log(cartNumbers)
      return this.http.post(`${environment.host}/api/v2/storefront/order_merge`, {
        order_number: cartNumbers.slice(-1)[0]
      })
    }
  }
}
