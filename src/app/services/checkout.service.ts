import { Injectable } from '@angular/core';
import { SecurityProvider } from './security.service';
import { CartService } from './cart.service';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { ActivationEnd, NavigationEnd, Router } from '@angular/router';
import * as Sentry from "@sentry/angular";
import { ModalsService } from './modals.service';

const PAYMENT_STATUS_CODES = {
    "-96": "tbk_user no existente",
  "-97": "Límites Oneclick, máximo monto diario de pago excedido.",
  "-98": "Límites Oneclick, máximo monto de pago excedido",
  "-99": "Límites Oneclick, máxima cantidad de pagos diarios excedido.",
  "-1":"Tarjeta inválida",
  "-2":"Error de conexión",
  "-3":"Excede monto máximo",
  "-4":"Fecha de expiración inválida",
  "-5":"Problema en autenticación",
  "-6":"Rechazo general",
  "-7":"Tarjeta bloqueada",
  "-8":"Tarjeta vencida",
  "-9":"Transacción no soportada",
  "-10":"Problema en la transacción",
  "-11":"Excede límite de reintentos de rechazos (Próximamente)",
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  public cartErrors$: BehaviorSubject<[]> = new BehaviorSubject<[]>([]);
  address;
  public latamCode;
  public promotionInput;
  public inTransition = false;
  public calculatingAmounts = false;
  public paying = false;

  constructor(private securityProvider: SecurityProvider,
              private cartService: CartService,
              private modalsService: ModalsService,
              private router: Router,
              private http: HttpClient) {
                
  }

  async releaseCart(){
    this.cartService.setCart()
  }

  async confirmOrderCompleted(orderToken = null){
    try {
      const newHeaders = {};
      newHeaders['X-Spree-Order-Token'] = orderToken || this.cartService.activeCart$.getValue().data.attributes.token;
      let options = { headers: new HttpHeaders(newHeaders) }
      let res: any = await this.http.get(environment.host + 'api/v2/storefront/account/order_status?order_number='+this.cartService.activeCart$.getValue().data.attributes.number, options).toPromise()
      if (res.message == "complete") {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }

  decodeResponseCode(code){
    return PAYMENT_STATUS_CODES[code]
  }

  setErrors(error) {
    this.cartErrors$.next(error);
  }

  getErrors() {
    return this.cartErrors$;
  }

  async complete() {
    this.paying = true;
    if(!(await this.cartService.redirectIfOrderIsCompleted(this.cartService.activeCart$.getValue(), true))){
      return this.http.get(environment.host + 'api/v2/storefront/account/v2pay', {});
    }
  }

  async goToCheckout(){
    const cart = this.cartService.getActiveCart$().getValue
  }

  async verifyAddress(address){
    const cartAddress = this.cartService.getActiveCart$().getValue
  }

  async next(order) {
    const bearerToken = await this.cartService.orderToken();
    if (['cart', 'address', 'delivery'].includes(order.state)) {
      try{
        const response = await this.securityProvider.getClient().checkout.orderNext(bearerToken, {
          include: 'line_items,variants,variants.product.images,variants.images,billing_address,shipping_address,user,payments,shipments,promotions'
        });
        if(!response){
          console.error("No response", response)
          return null
        }
        if (response.isFail()) {
          console.error(response.fail().errors.base);
          if(response.fail().errors.base[0] == 'No hay pagos encontrados'){
            this.cartService.showCart();
          }
        } else {
          await this.cartService.setActiveCart(response.success())
        }
        return response;
      } catch (e){
        return e
      }
    }
  }

  async restartCartState(token = null) {
    try {
      this.cartErrors$.next([])
      const orderToken = token ? token : await this.cartService.orderToken();
      const oldState = this.cartService.getActiveCart$().getValue()
      const newHeaders = {};
      newHeaders['X-Spree-Order-Token'] = orderToken.orderToken || orderToken.bearerToken || orderToken;
      let options = { headers: new HttpHeaders(newHeaders) }
      let res = this.http.put(environment.host + '/api/v2/storefront/restart_flow', {}, options);
      await res.toPromise()
      let cart = await this.cartService.showCart();
      cart = cart.isSuccess() ? cart.success() : cart.fail()
      //await res.toPromise()
      //this.updateOrderAddress(this.address)
      return true;
    } catch (e) {
      this.cartService.showToast("Hubo un error al conectarse con el servidor")
      return false;
    }
  }

  async getPaymentMethods() {
    const orderToken = await this.cartService.orderToken();
    return await this.securityProvider.getClient().checkout.paymentMethods(orderToken);
  }

  async ValidatePaymentEdenred(code: string) {
    return this.http.get(`${environment.host}api/v2/storefront/account/pay_with_edenred/?code=${code}`)
  }

  async getShippingMethods() {
    const orderToken = await this.cartService.orderToken();
    return await this.securityProvider.getClient().checkout.shippingMethods(
      orderToken,
      {
        include: 'shipping_rates,stock_location'
      }
    )
  }

  async goToSelectShipping(address){
    let cart = await this.cartService.getActiveCart()
    console.log(cart)
    if(cart.data.attributes.state != 'cart'){
      console.log("Cart state", cart.data.attributes.state)
    }
    cart = await this.cartService.getActiveCart()
    console.log(cart)
    if(cart.data.attributes.state == 'cart'){
      let response = await this.next(cart.data.attributes)
    } else {
      this.cartService.setActiveCart(cart)
    }
    cart = await this.cartService.getActiveCart() 
    if(cart.data.attributes.state == 'address' && false){
      let response = await this.next(cart.data.attributes)
      if(response.isSuccess()){
        console.log(response.success())
        return response.success()
      } else {
        console.log("Error")
       return null
      }
    }
    return null
  }

  async updateOrderAddress(address = null) {


    let res;
    const orderToken = await this.cartService.orderToken();
    const newHeaders = {};
    newHeaders['X-Spree-Order-Token'] = orderToken.orderToken || orderToken.bearerToken;
    let options = { headers: new HttpHeaders(newHeaders) }
    this.address = address;
    res =  this.http.put(`${ environment.host }/api/v2/storefront/set_address`, {
      ship_address_id: address.id
    }, options)
    return res
  }

  public async orderUpdate(options){
    const orderToken = await this.cartService.orderToken();
    const response = await this.securityProvider.getClient().checkout.orderUpdate(
      orderToken,
      options
    );
    if (response.isSuccess()) {
      console.log(response.success());
    }
  }

  public async updateOrderLatamCode(){
    const orderToken = await this.cartService.orderToken();
    const order = {
      latam_code: this.latamCode ? this.latamCode : null
    }
    const response = await this.securityProvider.getClient().checkout.orderUpdate(
      orderToken,
      { order : order }
    );
    if (response.isSuccess()) {
      console.log(response.success());
    }
    return response
  }

  async calculateCosts(currentCart = this.cartService.activeCart$.getValue()?.data.attributes){
    this.cartService.loadingCart$.next(true);
    let res;
    console.log(currentCart.state, 'CARRO')
    try{
      if(currentCart.state == 'cart'){
        res = await this.next(currentCart);
        if (res.isFail()) {
          return res.fail().summary;
        }
        res = await this.next(currentCart);
        if (res.isFail()) {
          return res.fail().summary;
        }
        res = await this.next(currentCart);
        if (res.isFail()) {
          return res.fail().summary;
        }
      } else if (currentCart.state == 'address'){
        res = await this.next(currentCart);
        if (res.isFail()) {
          return res.fail().summary;
        }
        res = await this.next(currentCart);
        if (res.isFail()) {
          return res.fail().summary;
        }
      } else if (currentCart.state == 'delivery'){
        res = await this.next(currentCart);
        if (res.isFail()) {
          return res.fail().summary;
        }
      } else {
        console.log(currentCart.state, "no valid state to next")
      }
    } catch(e){
      console.error(e)
    } 
    this.cartService.loadingCart$.next(false);
    return undefined;
  }

  async updateOrderPayment() {
    const orderToken = await this.cartService.orderToken();
    const order = {
      payments_attributes: [
        {
          payment_method_id: 39
        }
      ]
    }
    const response = await this.securityProvider.getClient().checkout.orderUpdate(
      orderToken,
      { order }
    );
    if (response.isSuccess()) {
      console.log(response,"resp")
      console.log(response.success());
    }
  }

  async completeOrder(card, orderId, deviceToken?) {
    const { id } = card.relationships.payment_method.data
    const orderToken = await this.cartService.orderToken();
    const order = {
      state: 'payment',
      payments_attributes: [
        {
          payment_method_id: 42
        }
      ]
    }

    const payment_source = {
    42: {
        order_id: orderId,
        credit_card_id: card.id,
        subscription_id: card.attributes.subscription_id,
        token: deviceToken ? deviceToken : card.attributes.kushki_token
      }
    }
    const response = await this.securityProvider.getClient().checkout.orderUpdate(
      orderToken,
      { order, payment_source }
    )
    return response
  }

  async completeOrderWebPay(kushKiToken, number, orderId) {
    console.log(kushKiToken, number, orderId)
    const orderToken = await this.cartService.orderToken();
    const order = {
      state: 'payment',
      payments_attributes: [
        {
          payment_method_id: 43
        }
      ]
    }

    const payment_source = {
      43: {
        name: number,
        order_id: orderId,
        token: kushKiToken
      }
    }
    const response = await this.securityProvider.getClient().checkout.orderUpdate(
      orderToken,
      { order, payment_source }
    )
    return response
  }
  async completeOrderMeercadoPago(data) {
    const orderToken = await this.cartService.orderToken();
    const order = {
      state: 'payment',
      mercadopago: {
        ...data
      },
      payments_attributes: [
        {
          payment_method_id: 49,
        },

      ],
    }
    const response = await this.securityProvider.getClient().checkout.orderUpdate(
      orderToken,
      { order }
    )
    return response
  }

  async nextWebPayOrder() {
    try{
      const bearerToken = await this.cartService.orderToken();
      const response = await this.securityProvider.getClient().checkout.orderNext(bearerToken, {
        include: 'line_items,variants,variants.product.images,variants.images,billing_address,shipping_address,user,payments,shipments,promotions'
      });
      if(!response){
        console.error("No response", response)
        return null
      }
      if (response.isFail()) {
        console.error(response.fail().errors.base);
        if(response.fail().errors.base[0] == 'No hay pagos encontrados'){
          this.cartService.showCart();
          console.log("Restarting")
        }
      } else {
        await this.cartService.setActiveCart(response.success())
      }
      return response;
    } catch (e){
      console.log("Response Errror", e)
      return e
    }
  }

  getMercadoPagoUser(accessToken: string) {
    return this.http.get(`${ environment.host }api/v2/storefront/mercadopago/user`, {
      headers: {
        'Authorization': 'Bearer' + accessToken
      }
    })
  }

}
