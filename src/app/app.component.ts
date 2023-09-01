
import { Component, Input } from '@angular/core';
import { SecurityProvider } from './services/security.service';
import { TaxonsServices } from './services/taxons.services';
import { ProductsService } from './services/products.service';
import { AddressService } from './services/address.service';
import { AnimationOptions } from 'ngx-lottie';
import { Storage } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { enableProdMode } from "@angular/core";
import { LaunchDarklyService } from './services/launch-darkly.service';
import { FcmService } from './services/fcm.service';
import { AlertController, Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { Deploy } from 'cordova-plugin-ionic';
import { Network } from '@capacitor/network';
import { ModalsService } from './services/modals.service';
import { UserSyncroService } from './shared/firebase/providers/user-syncro';
import { App } from '@capacitor/app';
import { doc, getDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { environment } from 'src/environments/environment';
import { Loader } from '@googlemaps/js-api-loader';
import { DynamicLinksService } from './services/dynamic-links.service';
import { RecepiesService } from './services/recepies.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
    public activated = null; 
    @Input() 'link': any
    constructor(private securityProvider: SecurityProvider,
              public productsService: ProductsService,
              public addressService: AddressService,
              public nativeStorage: Storage,
              public statusBar: StatusBar,
              public taxonsService: TaxonsServices,
              private ldService: LaunchDarklyService,
              private modalService: ModalsService,
              private platform:Platform,
              private fcmService: FcmService,
              private fireStore: Firestore,
              private recipeService: RecepiesService,
              private userSyncro: UserSyncroService,
              private dynamicLinksService: DynamicLinksService,
              private alertController: AlertController,
              private iab: InAppBrowser,
              private router: Router) {
  
    this.checkInternetConnection() 
    this.securityProvider.initSession();
    this.initGMaps()
    this.recipeService.getMainCategories()
    this.checkVersionApp()
    if(!this.platform.is("android")){
      this.checkUpload();
    }
    setTimeout(()=>{
      this.dynamicLinksService.listenAppUrlOpen()
      this.dynamicLinksService.checkAppLaunchUrl()
      if(!this.platform.is("mobileweb")){
        this.fcmService.initPushService()
      }
      this.registerDevice()
      setTimeout(()=>{
        // this.goToLink();
      }, 1800)
      SplashScreen.hide();
    },2000)
    this.statusBar.styleDefault();
  }

  async initGMaps() {
    const loader = new Loader({
      apiKey: environment.GOOGLE_MAPS_KEY,
      version: 'weekly',
      libraries: ['places']
    })
  }

  async checkInternetConnection(){
    const status = await Network.getStatus();
    Network.addListener('networkStatusChange', (status:any)=>{
      console.log(status)
    })
  }

  async checkUpload() {
    await Deploy.getConfiguration();
    const checkUpdates = await Deploy.checkForUpdate();
    console.log('# DEPLOY CHECK', checkUpdates)

    if(checkUpdates.available && !checkUpdates.incompatibleUpdateAvailable) {
      try {
        await Deploy.downloadUpdate();
        await Deploy.extractUpdate()
        await Deploy.reloadApp()
        console.log('# DEPLOY CORRECT')
      } catch (error) {
        console.log('# DEPLOY ERROR', error)
      }
    }

  }

  // async goToLink() {
  //   this._appsFlyerService.getLink$.subscribe(resp => {
  //     this.link = resp;
  //     if (!this.link) {
  //       return
  //     } else if(typeof(this.link) === 'string') {
  //       if (this.link.includes('/')) {
  //         this.router.navigate([this.link]).then();
  //       } else {
  //         this._appsFlyerService.openRecipe(this.link)
  //       }
  //     } else {
  //     }
  //   })
  // }


  async registerDevice() {
    if (this.securityProvider.isLoggedIn().value) {
      await this.fcmService.addDeviceWithOutLogin()
    }
  }

  async checkVersionApp() {

    const infoApp = await App.getInfo()
    if (this.platform.is('ios')) {
      const docRef = doc(this.fireStore, 'app', 'iOS');
      const docSnap = await getDoc(docRef);
      const document = { ...docSnap.data(),}
      if (infoApp.version < document.store_version || infoApp.build < document.store_build) {
        this.presentAlert('https://apps.apple.com/CL/app/id1578951757?mt=8')
      }
      return 
    }

    if (this.platform.is('android')) {
      const docRef = doc(this.fireStore, 'app', 'android');
      const docSnap = await getDoc(docRef);
      const document = { ...docSnap.data(),}
      if (infoApp.version < document.store_version || infoApp.build < document.store_build) {
        this.presentAlert('https://play.google.com/store/apps/details?id=cl.lomi.app')
      }
      return 
    }
  }

  async presentAlert(link) {
    const alert = await this.alertController.create({
      header: 'Actualiza la App',
      cssClass: 'test-alert',
      message: 'Hay una nueva version de LOMI',
      buttons: [
        {
          text: 'Ahora no',
          cssClass: 'alert-button-cancel',
          handler: () => {},
        },
        {
          text: 'Actualizar',
          handler: () => { 
            this.iab.create(link)
          }
        }
      ],
    });

    await alert.present();
  }

}
