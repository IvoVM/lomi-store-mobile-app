import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { SecurityProvider } from './security.service';
import { CheckoutService } from './checkout.service';
import { CartService } from './cart.service';
import { Utils } from '../../utils/util';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Storage } from '@ionic/storage';
import { ProductsService } from './products.service';
import { Router } from '@angular/router';
import * as Sentry from "@sentry/angular";
import { stockLocationByCountyId } from '../county-selector-modal/county_stock-location'
import { UserEventsService } from '../user-events/user-events.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  public activeAddress$ = new Subject();
  public address;
  public addresses$: BehaviorSubject<[]> = new BehaviorSubject<[]>(null);
  public loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public shipmentType = "";
  public globalAddresses;

  counties:any = []

  constructor(private securityProvider: SecurityProvider,
              private checkoutService: CheckoutService,
              private http: HttpClient,
              private productsService: ProductsService,
              private routerService: Router,
              private nativeStorage: Storage,
              private securityService: SecurityProvider,
              private userEventsService: UserEventsService,
              private cartService: CartService) {

    let locationLoaded = false;
    this.securityProvider.sessionReady$.subscribe(async () => {
      if((!await nativeStorage.get('cartOrderToken'))){        
        await this.cartService.setCart();
      } else {
        const res = await this.cartService.showCart();
      }
    })
    this.cartService.getActiveCart$().subscribe(async (cart) => {
      if (cart) {
        const address = Utils.getIncluded(cart, 'address')[0];
        this.address = address;
        const { stock_locations } = cart.data.attributes
        const stockLocations = stock_locations.map(sl => sl.id)      
        this.setCurrentAddress(address, stockLocations);
        setTimeout(() => this.loading.next(false),2000);
      }
    });

    this.getGlobalAddresses().then(async (globalAddresses)=>{ //Auxiliar for giving global address a stock_location id
      this.globalAddresses = await globalAddresses.json()
      const globalAddress = this.globalAddresses.data.forEach((globalAddress)=>{
        const county = stockLocationByCountyId.find((county)=>{
          return globalAddress.attributes.lastname == county.comuna
        })
        globalAddress.stockLocationId = county ? county.stock_location_id : null
      })
    })
  }

  async addressSelected(){
    return this.nativeStorage.get("addressSelected")
  }

  get addresses() {
    return this.addresses$;
  }

  get activeAddress() {
    return this.activeAddress$;
  }

  getCounties() {
    const url = environment.host + '/api/v1/counties';
    return this.http.get(url);
  }

  getCountries() {
    const url = environment.host + '/api/v2/storefront/countries?include=states';
    return this.http.get(url);
  }

  async setCurrentAddress(address, stockLocationId) {
    this.shipmentType = address.attributes.global ? "pickup" : "delivery";
    this.address = address
    this.nativeStorage.set('stockLocations', stockLocationId).then(() => {
      address.stockLocationId = stockLocationId
      this.activeAddress$.next(address);
    });
  }

   getStockLocationschedule(stockLocation: string) {
   return this.http.get(`${environment.host}/api/v2/storefront/stock_locations/${stockLocation}/schedules`)
    .pipe(
      map((resp: any) => resp.schedules)
    )
  }

  async setActiveAddress(address, shipmentType = "delivery") {
    this.productsService.flushProducts();
    this.loading.next(true);
    this.nativeStorage.set("addressSelected", new Date())
    this.nativeStorage.set('currentAddress', address)
    let returnValue;
    if(address){
      this.address = address
      this.shipmentType = address.attributes.global ? 'pickup' : 'delivery';
      const res = await this.checkoutService.updateOrderAddress(address)
      const resp = await res.toPromise()
      if(resp.stock_location_ids){
        returnValue = resp
        this.setCurrentAddress(address, resp.stock_location_ids)
      }
    }
    this.loading.next(false)
    return returnValue
  }
  
  
  async addressesList() {
    if (!this.securityProvider.getAccessToken()) return;
    const response = await this.securityProvider.getClient().account.addressesList(
      { bearerToken: this.securityProvider.getAccessToken() }
    );

    if (response.isSuccess()) this.addresses$.next(response.success().data);
  }

  async createAddress(addressData, addressId = null) {
    let response;
    const address = {
      firstname: addressData.firstname,
      lastname: addressData.lastname,
      phone: addressData.phone,
      country_id: addressData.country_id,
      state_id: addressData.state_id,
      city: addressData.city,
      county_id: addressData.county_id,
      state_name: addressData.state_name,
      address1: addressData.address1,
      address2: addressData.address2,
    }

    if (addressId) {
      response = await this.securityProvider.getClient().account.updateAddress(
        { bearerToken: this.securityProvider.getAccessToken() },
        addressId,
        { address }
      );
    } else {
      response = await this.securityProvider.getClient().account.createAddress(
        { bearerToken: this.securityProvider.getAccessToken() },
        { address }
      );
    }

    await this.addressesList();

    return response;
  }

  async removeAddress(addressId = null) {
    const resp = await this.securityProvider.getClient().account.removeAddress({ bearerToken: this.securityProvider.getAccessToken() }, addressId);
    if (resp.isSuccess()) {
      await this.addressesList();
    }
  }

  getGlobalAddresses() {
    const url = environment.host + '/api/v2/storefront/global_addresses';

    return fetch(
      url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/vnd.api+json; charset=utf-8'
        }
      })
  }
}
