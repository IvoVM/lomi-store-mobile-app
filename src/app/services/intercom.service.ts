import { Injectable } from '@angular/core';
import { Intercom } from 'ng-intercom';
import { SecurityProvider } from './security.service';
import { CartService } from './cart.service';
import { appVersionData } from '../app-version';

@Injectable({
  providedIn: 'root'
})
export class IntercomService {
  userData;
  appId = 'oebymh9s';
  appVersionNumber;
  constructor(
    public intercom: Intercom,
    private securityProvider: SecurityProvider,
    private cartService: CartService,
      ) {
  }

  intercomStart() {
    this.setUser(this.securityProvider.isLoggedIn$.getValue());
    this.securityProvider.isLoggedIn$.subscribe((user) => {
      this.setUser(user);
      this.initService();
   });
  }

  async initService() {
    let data = {
      api_base: 'https://api-iam.intercom.io',
      app_id: this.appId,
      hide_default_launcher: true
    }

    if (this.userData) {
      data = { ...data, ...this.userData }
    }

    this.intercom.boot(data);
  }

  show(message = null) {
    this.intercom.show(message);
  }

  setUser(user) {
    if (user) {
      this.cartService.activeCart$.subscribe(cart => this.setUserData(this.securityProvider.getUserData(), cart))
    } else {
      this.userData = null;
    }
  }

  setUserData(user, cart) {
    if (!user || !cart) return 
    this.userData = {
      name: user.data.attributes.email,
      app_version : appVersionData.versionName,
      www_version : appVersionData.wwwVersionName,
      native_version: appVersionData.nativeName,
      native_build: appVersionData.nativeNumber,
      is_prime: user.data.attributes.is_prime,
      store_id: cart.data.attributes.stock_locations[0].id,
      user_id: user.data.id,
      email: user.data.attributes.email,
      order_number: cart ? `https://lomi.cl/admin/orders/${ cart.data.attributes.number }/cart` : '',
      last_order_number: '',
      item_total: cart ? cart.data.attributes.item_total : '',
      item_count: cart ? cart.data.attributes.item_count : '',
      context: "APP",
      address: cart.data.attributes.stock_locations[0].admin_name,
      created_at: ''
    };
  }
}
