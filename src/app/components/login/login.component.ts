import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AlertController, NavController, ToastController, isPlatform, ModalController, Platform } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from '@angular/router';
import { SecurityProvider } from '../../services/security.service';
// import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { CartService } from '../../services/cart.service';
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser/ngx';
import { FcmService } from 'src/app/services/fcm.service';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Subscription } from 'rxjs';
import { LaunchDarklyService } from '../../services/launch-darkly.service';
import { Storage } from '@ionic/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { appVersionData } from 'src/app/app-version';
import { AddressService } from 'src/app/services/address.service';
import { NumberPhoneComponent } from 'src/app/number-phone/number-phone.component';
import { SignInWithApple, SignInWithAppleOptions, SignInWithAppleResponse } from '@capacitor-community/apple-sign-in'
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { getAuth, RecaptchaVerifier } from "firebase/auth";
import { testUsers } from './test-user';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Component({
  selector: 'app-login-component',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})

export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  loginError = false;
  googleUser = null;
  //Feature flags
  phoneRecaptchaVerifier
  googleSignInFlag = false;
  @Input() cartRedirect;
  @Output() public closeModal = new EventEmitter<boolean>();

  constructor(private alerts: AlertController,
              public formBuilder: FormBuilder,
              private router: Router,
              // private fb: Facebook,
              private cartService: CartService,
              private security: SecurityProvider,
              private iab:InAppBrowser,
              private toastCtrl: ToastController,
              private modalCtrl: ModalController,
              private afAuth: AngularFireAuth,
              private navCtrl: NavController,
              private ldService: LaunchDarklyService,
              private fcmService: FcmService,
              private platform: Platform,
              private addressService: AddressService,
              private httpClient:HttpClient,
              private nativeStorage: Storage,
              private userEventsService: UserEventsService) {
    //if(isPlatform('capacitor')) {
    GoogleAuth.initialize();
    //}
  }

  goToForgotPassword() {
    this.iab.create('https://lomi.cl/password/recover', '_system')
    // this.router.navigate(['/login/recover-password'])
  }


  async ngOnInit() {
    window.analytics.track('login_screen.loaded')
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      password: ['']
    });
  }

  identifyUser(userData : any = this.security.getUserData()){
    window.analytics.identify(userData.data.id, {
      email: userData.data.attributes.email,
      traits: {
        email: userData.data.attributes.email,
        name: userData.data.attributes.first_name + ' ' + userData.data.attributes.last_name ,
        quantityOfOrders: userData.data.attributes.completed_orders
      },
      app_version: appVersionData.versionName,
      www_version: appVersionData.wwwVersionName,
      native_version: appVersionData.nativeName,
      native_build: appVersionData.nativeNumber,
      userId: userData.data.id
    });
    this.userEventsService.userEvents.userSignedIn.track({
      id: userData.data.id,
      email: userData.data.attributes.email,
      newUser: 0
    });
    this.fcmService.addDevice(userData.data.attributes.email);
  }

  mergeOrders(){
    this.cartService.mergeOrder().then(data =>data ? data.subscribe(resp => {
      this.cartService.showCart();
    }) : null);
  }

  signIn() {
    this.submitted = true;
    if (!this.loginForm.valid) {
      return false;
    } else {
      var self = this;
      this.security.fetchUserData(this.loginForm.value).then(resp => {
        if (resp.isFail()) {
          this.loginError = true;
        } else {
          var userData = self.security.getUserData();
          var userData = this.security.getUserData();
          this.identifyUser()
          this.mergeOrders()
          if (this.router.url.includes('/login')) {
            this.navCtrl.pop().then((resp)=>{
              console.log(resp)
              if(this.router.url.includes('/login')){
                this.navCtrl.navigateBack('/home')
              }
            });
          } else {
            this.closeModal.emit(true);
          }
          this.showToast();
        }
      });
    }
  }

  trackRegister() {
    window.analytics.track('registration.clicked')
  }

  get errorCtr() {
    return this.loginForm.controls;
  }

  async exitLogin(){
    if (this.cartRedirect) {
      this.router.navigate(['cart']).then(() => {
        this.showToast().then(() => this.closeModal.emit(true));
      });
    } else {
      this.router.navigate(['home']).then(() => {
        this.showToast().then();
      });
    }
  }

  async googleSignIn() {
    await GoogleAuth.signOut();
    this.googleUser = await GoogleAuth.signIn();
    await this.nativeStorage.set('googleImageUrl', this.googleUser.imageUrl)
    const resp = await this.security.fetchUserDataByToken(this.googleUser)
    if (!this.security.isAnIOAuthToken(resp)) {
      window.analytics.track('googleAuthResp', { status: 'fail'})
      this.loginError = true;
    } else {
      window.analytics.track('googleAuthResp', { status: 'success' })
      this.identifyUser()
      await this.cartService.mergeOrder()
      this.exitLogin()
    }
  }

  async loginWIthSms() {

    this.submitted = true;
    if (!this.loginForm.valid) {
      return false;
    }
    const modal = await this.modalCtrl.create({
      component: NumberPhoneComponent,
      canDismiss: true,
      cssClass: 'add-discount-modal',
    })
    await modal.present();
    let { data } = await modal.onWillDismiss()
    let number = data
    
    const auth = getAuth();
    this.phoneRecaptchaVerifier = new RecaptchaVerifier('sign-in-button', {
      'size': 'invisible',
      'callback': (response) => {
      }
    }, auth);
    let confirm = await this.afAuth.signInWithPhoneNumber(number, this.phoneRecaptchaVerifier)
    this.confimSmsValue(confirm)
  }

  async confimSmsValue(confirm: any) {
    const modal = await this.modalCtrl.create({
      component: NumberPhoneComponent,
      canDismiss: true,
      cssClass: 'add-discount-modal',
    })
    await modal.present();
    let { data } = await modal.onWillDismiss()
    let code = data
    let response = await confirm.confirm(code)
    if (response.error) {
      console.log(response)
      return false
    }
    var email = this.loginForm.value.email;
    var self = this;
    this.security.fetchUserData(this.loginForm.value).then(resp => {
      if (resp.isFail()) {
        this.loginError = true;
        console.log("Fail")
      } else {
        this.identifyUser()
        this.cartService.mergeOrder().then(data => data.subscribe(resp => {
          this.modalCtrl.dismiss()
          this.cartService.showCart();
        }));
        this.exitLogin();
        this.showToast();
      }
    });
  }

  async sendFirebaseToken(identityToken, idProvider){
    const authEndpoint = environment.host + "/api/v2/oauth/firebase_authenticate"
    console.log('### EPDATA',{
      identityToken,
      idProvider
    })
    this.httpClient.post(authEndpoint,{
      id_token: identityToken,
      id_provider: idProvider
    }).subscribe(async (res:any)=>{
      console.log('### fstoken1', res)
      await this.security.setSession(res)
      this.identifyUser()
      await this.cartService.mergeOrder()
      this.exitLogin()
    }, err => console.log(console.log('### fstoken1 error', err)))
  }

  async signInAppleFirebase() {
    
    if (!this.platform.is('ios')) {
      const provider = new firebase.auth.OAuthProvider('apple.com')
      provider.addScope('email')
      provider.addScope('name')
  
      let response:any = await this.afAuth.signInWithPopup(provider)
      await this.sendFirebaseToken(response.credential.idToken, response.credential.providerId)

    } else {
      let options: SignInWithAppleOptions = {
        clientId: 'cl.lomi.app',
        redirectURI: 'https://lomi-35ab6.firebaseapp.com/__/auth/handler',
        scopes: 'email'
      }
  
      SignInWithApple.authorize(options).then(async (resp: SignInWithAppleResponse) => {
        const provider = new firebase.auth.OAuthProvider('apple.com')
        console.log("Is here")
        const credential = provider.credential({
          idToken: resp.response.identityToken
        })
  
        // const userCredental:any = await this.afAuth.signInWithCredential(
        //   credential
        // );
        // const { providerData } = userCredental.user
        await this.sendFirebaseToken(credential.idToken , "apple.com")
      })
    }

  }

  async signInGoogleFirebase() {
    this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(
      resp => {
        console.log(resp)
        let data = {
          authentication: {
            accessToken: resp.credential['accessToken'],
            idToken: resp.credential['idToken'],
            refreshToken: ''
          },
          email: resp.additionalUserInfo.profile['email'],
          familyName: resp.additionalUserInfo.profile['family_name'],
          id: resp.additionalUserInfo.profile['id']
        }
        this.sendFirebaseToken(resp.credential['idToken'], 'google.com')
        return


        this.security.fetchUserDataByToken(data).then(resp => {
          console.log('resp:');
          console.log(resp);
          if (!this.security.isAnIOAuthToken(resp)) {
            this.loginError = true;
          } else {
            console.log(typeof resp);
            var userData = this.security.getUserData();
            console.log(userData);
            window.analytics.identify(userData.data.id, {
              "email": userData.data.attributes.email,
              app_version: appVersionData.versionName,
              www_version: appVersionData.wwwVersionName,

            });
            window.analytics.track('UserSignedIn', {
              "id": userData.data.id,
              "email": userData.data.attributes.email
            });
            this.fcmService.addDevice(userData.data.attributes.email);
            this.cartService.mergeOrder().then(data => data.subscribe(resp => {
              this.cartService.showCart();
            }));
            if (this.cartRedirect) {
              this.router.navigate(['cart']).then(() => {
                this.showToast().then(() => this.closeModal.emit(true));
              });
            } else {
              this.router.navigate(['home']).then(() => {
                this.showToast().then();
              });
            }
          }
        });
      }
    )
  }

  async firebaseAuth() {
    if (!this.loginForm.valid) return
    const { email, password } = this.loginForm.value
    let userCredential = await this.afAuth.signInWithEmailAndPassword(email, password)
    console.log(userCredential)
    const googleData = {
      authentication: {
        accessToken: "ya29.a0AVA9y1s2jCpvsMPmgzY3zpxYMAP338OG_WZ3BYz6woueaAxkO5kf9stspiUmuNI17eTPG6CBYcLZenXnQ5PtszzFzaMgbeZkM7xXarP6YhdgUqCkEo8R1lVqYXnA0OtPO2STudk5Z6iSa5Ie06PFoy_B4j_MKis",
        idToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjI2NTBhMmNlNDdiMWFiM2JhNDA5OTc5N2Y4YzA2ZWJjM2RlOTI4YWMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMzk0ODQ3ODMwNDI1LWZjcG1ycHAxc2MwM3ZyamR0NjNpYnBpMmowc3FpMnJqLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMzk0ODQ3ODMwNDI1LWZjcG1ycHAxc2MwM3ZyamR0NjNpYnBpMmowc3FpMnJqLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTE2NjE5OTg3NTE4NzM1MDYxMDM0IiwiaGQiOiJsb21pLmNsIiwiZW1haWwiOiJtYXJjb0Bsb21pLmNsIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiI2U0FUa1lWVEJQV21sWHh6ci0yeXFnIiwibmFtZSI6Ik1hcmNvIFZhbGRpdmllc28iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUl0YnZtbjl6SmMzcFhkeEFRNWdIUEp5Nk1fWFRNd1dOX25PZFFOZFNaVmY9czk2LWMiLCJnaXZlbl9uYW1lIjoiTWFyY28iLCJmYW1pbHlfbmFtZSI6IlZhbGRpdmllc28iLCJsb2NhbGUiOiJlcy00MTkiLCJpYXQiOjE2NTcxNTY2MTgsImV4cCI6MTY1NzE2MDIxOCwianRpIjoiODVjYTg5Mjg2MGRkYWZkYWY4Y2JjNjFjZDZkZjdiMjdjOTFkMDY1NSJ9.kuFnmxTycUpLMnEUVblutaZYJ-LTsiQeEKTuSh8hFaUC6p4Rgepm_fGoiaMZbquncSn-sxx2wdIkmptMyaHe5ckW8KgojG9iNcNyH-5kVTkiTwjNkx2DUxwkQgs0OVgLPZZKLUuy7UE-QWyERMZKvFtmQk6pUSxJgE50_iGKtviZ8vBhEcNe3RkAgEGVJNdVMn8F87B0RCe9mUmYVlEuHZFx8pq3GyvYNQw5FP40fSlbu4qjXTEgkDwSiP-0BhTc6CdBOx4ah2MeNXNL3uXTC0vBbp_tlMXnZJjzgNu637eJaAvjRYMZwsPSQPkxdtJq4cnYFUbAGz4RCRI_RUwcog",
        refreshToken: userCredential.user.refreshToken
      },
      email: userCredential.user.email,
      id: userCredential.user.uid,
    }
    this.security.fetchUserDataByToken(googleData)
  }


  async showToast() {
    await this.toastCtrl.create({
      message: "Ingreso exitoso",
      duration: 2000,
      position: 'bottom',
      color: 'primary',
      buttons: [{
        text: 'OK',
        handler: () => {
          console.log("ok clicked");
        }
      }]
    }).then(res => res.present());
  }
}


