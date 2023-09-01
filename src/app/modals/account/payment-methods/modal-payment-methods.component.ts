import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { SecurityProvider } from '../../../services/security.service';
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser/ngx';

interface ICardInscription {
  redirect_url: string;
}

interface ICardSubscriptionData {
  oneclick_auth_code: string;
  oneclick_card_number: string;
  oneclick_card_type: string;
  oneclick_updated_at: string;
  subscribed: boolean
  success?: boolean
}

@Component({
  selector: 'app-modal-payment-methods',
  templateUrl: './modal-payment-methods.component.html',
  styleUrls: ['./modal-payment-methods.component.scss'],
})
export class ModalPaymentMethodsComponent implements OnInit , OnDestroy{
  subscribed;
  loadingData = true;
  loading = true;
  subscriptionData: ICardSubscriptionData;
  interval;

  constructor(private modalCtrl: ModalController,
              private iab: InAppBrowser,
              private alertCtrl: AlertController,
              private toastCtrl: ToastController,
              private securityProvider: SecurityProvider) {
  }

  ngOnDestroy(){
    if(this.interval){
      clearInterval(this.interval)
    }
  }

  async ngOnInit() {
    this.getSubscription();
  }

  async dismiss() {
    if(this.interval){
      clearInterval(this.interval)
    }
    await this.modalCtrl.dismiss();
  }

  onAcceptTerms() {
    this.loading = true;
    this.securityProvider.initCardInscription()
      .subscribe(
        (data: ICardInscription) => {
          this.showCardForm(data.redirect_url)
        },
        (err) => {
          this.loadingData = false;
          if (err.errors) {
            this.onCardError().then();
          }
        }
      );
  }

  onRemoveCardConfirm() {
    this.securityProvider.cardUnsubscribe().subscribe(
      (data: any) => {
        this.loading = false;
        this.dismiss().then();
        this.showToast('Tarjeta desvinculada con éxito').then(
          () => this.getSubscription()
        )
      },
      (err) => {
        this.loading = false;
        this.showToast('No se pudo desvincular la tarjeta', 'danger');
      }
    );
  }

  showCardForm(url) {
    const target = '_blank';
    const options = 'location=no,clearcache=yes,clearsessioncache=yes,hideurlbar=yes,zoom=no';

    this.interval = setInterval(this.watchSubscription,20000)

    
    const browser = this.iab.create(url, target, options);

    browser.on('loadstart').subscribe(
      (event) => {
        if (event.url.match('/oneclick_mall/m_subscribe_success')) {
          this.showToast('Tarjeta vinculada con éxito');
          browser.close();
        } else if (event.url.match('/oneclick_mall/m_subscribe_failure')) {
          this.showToast('No se pudo vincular la tarjeta', 'danger');
          browser.close();
        }
      },
      (error) => console.error(error)
    );

    browser.on('exit').subscribe(
      (event: InAppBrowserEvent) => this.dismiss().then(),
      (error) => console.error(error)
    );
  }

  watchSubscription = async () => {
    this.securityProvider.getCardSubscriptionData().subscribe(
      (resp: ICardSubscriptionData) => {
        let subscribed = resp.subscribed;
        if(subscribed){
          this.showToast('Tarjeta vinculada con éxito');
          this.dismiss()
        }
      });
  }

  getSubscription = () => { 
    this.securityProvider.getCardSubscriptionData().subscribe(
      (resp: ICardSubscriptionData) => {
        this.subscribed = resp.subscribed;
        this.subscriptionData = resp;
        this.loadingData = false;
        this.loading = false;
      },
      error => {
        this.subscribed = false;
        this.loadingData = false;
        this.loading = false;
      });
  }

  async onCardError() {
    let alert = await this.alertCtrl.create({
      header: 'Desvincular tarjeta',
      message: 'No se ha podido completar su solicitud.',
      buttons: ['Aceptar'],
    });

    alert.present().then();
  }

  async onRemoveCard() {
    this.loading = true;
    let alert = await this.alertCtrl.create({
      header: 'Desvincular tarjeta',
      message: '¿Estás seguro que quieres desvincular esta tarjeta?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Desvincular',
          handler: () => this.onRemoveCardConfirm()
        }
      ]
    });
    await alert.present();
  }

  async showToast(message, color = 'primary') {
    await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color, //danger
      buttons: [{
        text: 'OK',
        handler: () => {
          console.log("ok clicked");
        }
      }]
    }).then(res => {
      res.present()
      this.getSubscription();
    });
  }

  getDate(date) {
    return new Date(date);
  }

}
