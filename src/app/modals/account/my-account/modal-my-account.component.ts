import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { SecurityProvider } from '../../../services/security.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Component({
  selector: 'app-modal-my-account',
  templateUrl: './modal-my-account.component.html',
  styleUrls: ['./modal-my-account.component.scss'],
})
export class ModalMyAccountComponent implements OnInit {
  updateForm: FormGroup;
  submitted = false;
  loginError = false;
  user;

  constructor(private modalCtrl: ModalController,
              private toastCtrl: ToastController,
              public formBuilder: FormBuilder,
              private router: Router,
              private security: SecurityProvider,
              private userEvents: UserEventsService,
              private securityProvider: SecurityProvider) {
    this.user = this.securityProvider.getUserData();
  }

  ngOnInit() {
    this.userEvents.userEvents['profile.loaded'].track()
    this.updateForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      password: ['', [Validators.required]],
      password_confirmation: ['', [Validators.required]],
    })
  }

  async dismiss() {
    await this.modalCtrl.dismiss();
  }

  update() {
    this.submitted = true;
    if (!this.updateForm.valid) {
      return false;
    } else {
      this.security.accountUpdate(this.updateForm.value).then(resp => {
        if (resp.isFail()) {
          this.loginError = true;
        } else {
          this.router.navigate(['home']).then(() => {
            this.showToast().then();
          });
        }
      });
    }
  }

  async onLogout() {
    await this.securityProvider.signOut();
    await this.dismiss();
    this.router.navigateByUrl('tabs/home');
    await this.toastCtrl.create({
      message: "Sesión finalizada",
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

  get errorCtr() {
    return this.updateForm.controls;
  }

  async showToast() {
    await this.toastCtrl.create({
      message: "Modificado con éxito",
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
