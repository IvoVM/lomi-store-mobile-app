import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { SecurityProvider } from '../../services/security.service';
import { NavController } from '@ionic/angular';
import { FcmService } from 'src/app/services/fcm.service';
import { appVersionData } from 'src/app/app-version';
import { LaunchDarklyService } from 'src/app/services/launch-darkly.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { CartService } from 'src/app/services/cart.service';
@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
  registerForm: FormGroup;
  registerError;

  goBack(){
    this.navCtrl.navigateRoot('/login')
  }

  constructor(private alerts: AlertController,
              public formBuilder: FormBuilder,
              private router: Router,
              private security: SecurityProvider,
              private navCtrl:NavController,
              private toastCtrl: ToastController,
              private ldService: LaunchDarklyService,
              private userEventsService: UserEventsService,
              private cartService: CartService,
              private fcmService: FcmService) {
  }

  ngOnInit() {
    window.analytics.page('registration');
    this.userEventsService.userEvents['registration.loaded'].track()
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      password: ['', [Validators.required]],
      password_confirmation: ['', [Validators.required]],
    })
  }

  async signUp() {
    const userDataFlag = await this.ldService.client.variation('user-data', false);
    if (!this.registerForm.valid) {
      return false;
    } else if (this.registerForm.value.password != this.registerForm.value.password_confirmation) {
      return this.registerError = ['Las contraseñas deben ser iguales']
    } else {
      let navigationExtras: NavigationExtras = {
        state: {
          newUser: true
        }
      }
      // this.router.navigate(['/about-you'], navigationExtras)
      var self = this;
      this.security.registerUser(this.registerForm.value).then(resp => {
        if (resp.isFail()) {
          console.log(resp.fail().errors)
          this.registerError = Object.values(resp.fail().errors);
        } else {
          var userData = self.security.getUserData();
          window.analytics.identify(userData.data.id, {
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
          this.userEventsService.userEvents.userSignedUp.track({
            id: userData.data.id,
            email: userData.data.attributes.email,
            newUser: 1
          });
          this.fcmService.addDevice(userData.data.attributes.email);
          this.mergeOrders()
            this.router.navigate(['home']).then(() => {
              this.showToast().then();
            });
        }
      });
    }
  }

  async signUpV1() {
    if (!this.registerForm.valid) {
      return false;
    } else if (this.registerForm.value.password != this.registerForm.value.password_confirmation) {
      return this.registerError = ['Las contraseñas deben ser iguales']
    } else {
      var self = this;
      this.security.registerUserV1(this.registerForm.value).subscribe((resp) => {
        this.mergeOrders()
        this.router.navigate(['home']).then(() => {
          this.showToast().then();
        });
      }, err => this.registerError = err)
    }
  }

  mergeOrders(){
    this.cartService.mergeOrder().then(data => data.subscribe(resp => {
      this.cartService.showCart();
    }));
  }
  get errorCtr() {
    return this.registerForm.controls;
  }

  async showToast() {
    await this.toastCtrl.create({
      message: "Registro exitoso",
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
