import { HttpBackend, HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ActionPerformed, PushNotifications, PushNotificationSchema, Token } from '@capacitor/push-notifications';
import { NavController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { environment } from 'src/environments/environment';
import { IPerson } from '../adapters/person.adapter';
import { ModalsService } from './modals.service';
import { ProductsService } from './products.service';
import { SecurityProvider } from './security.service';
import { TaxonsServices } from './taxons.services';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  userData: IPerson;
  constructor(
    private http: HttpClient,
    private handler: HttpBackend,
    private platform: Platform,
    private nativeStorage: Storage,
    private securityProvider: SecurityProvider,
    private taxonService: TaxonsServices,
    private productService: ProductsService,
    private modalService: ModalsService,
    private router: Router

  ) {
    this.http = new HttpClient(handler)
    this.securityProvider.isLoggedIn$.subscribe((user) => {
      this.userData = this.securityProvider.getUserData();
    });
   }

  public initPushService() {
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      } else {
        console.log('No tiene los permisos necesarios para recibier notificacioens');
      }
    });

    PushNotifications.addListener('registration',
      (token: Token) => {
        this.nativeStorage.set('devideId', token.value).then()
        console.log('#### TOKEN ####: ' + token.value);
      }
    );

    PushNotifications.addListener('registrationError',
      (error: any) => {
        console.log('#### Error on registration ####: ' + JSON.stringify(error));
      }
    );

    PushNotifications.addListener('pushNotificationActionPerformed',
    async (notification: ActionPerformed) => {
      let navigateTo = notification.notification.data.ruta
      if (!navigateTo) return 
      if (navigateTo === 'taxon') {
        let taxonId = notification.notification.data.page_id
        let taxon = await this.taxonService.getTaxon(taxonId)
        if (!taxon) return this.router.navigate(['tabs/home'])
        let ruta = `${navigateTo}/${taxonId}`
        this.router.navigate([ruta])
      } else if (navigateTo === 'product') {
        let product_id = notification.notification.data.product_id
        this.openProduct(product_id)
      }
    
    }
  );

  }
  async openProduct(link) {
    try {
      let product = await this.productService.getProductById(link);
      if (!product) return 
      this.modalService.openProduct(product);
    } catch (error) {
      console.log(error);
    }
  }

  async addDeviceWithOutLogin() {
    let isDeviceAdded = await this.nativeStorage.get('isDeviceAdded')
    if (!this.platform.is('ios') && !this.platform.is('android')) return console.log('### esta en compu')
    if (isDeviceAdded)  return console.log('### ya esta agregado')
    let email = this.userData ? this.userData.data.attributes.email : '';
    await this.addDevice(email);
  }

  async addDevice(email: string) {
    if (!this.platform.is('ios') && !this.platform.is('android')) return console.log('### esta en compu')
    const newHeaders = {};
    newHeaders['Authorization'] = 'Basic N2M0ODA3OTJiMDdmOTViMDE0ZGM6NDE3ZDJhYjIwNjIyODM2ZTZhNDg='
    newHeaders['content-type'] = 'application/json'
    
    let body = {
      device: {
        id: await this.nativeStorage.get('devideId'),
        platform: this.platform.is('ios')? 'ios': this.platform.is('android')? 'android' : ''
      }
    }
       return this.http.put(`https://track.customer.io/api/v1/customers/${email}/devices`, body, {
        headers: new HttpHeaders(newHeaders)
       }).subscribe(
      resp => console.log('###', JSON.stringify(resp)),
      err => console.log('###', err.message)
    );
  }

  async deleteDevice() {
    if (!this.platform.is('ios') && !this.platform.is('android')) return console.log('### esta en compu')
    const newHeaders = {};
    newHeaders['Authorization'] = 'Basic N2M0ODA3OTJiMDdmOTViMDE0ZGM6NDE3ZDJhYjIwNjIyODM2ZTZhNDg='
    newHeaders['content-type'] = 'application/json'

    let email = this.userData ? this.userData.data.attributes.email : '';
    let device_id = await this.nativeStorage.get('devideId');

    await this.nativeStorage.remove('isDeviceAdded').then()
    return this.http.delete(`https://track.customer.io/api/v1/customers/${email}/devices/${device_id}`, {
      headers: new HttpHeaders(newHeaders)
    })
      .subscribe(
        resp => console.log('####',JSON.stringify(resp)),
        err => console.log('###', err)
    );
  }
}
