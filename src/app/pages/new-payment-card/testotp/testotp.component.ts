import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IonInput, ModalController, NavController, ToastController } from '@ionic/angular';
import { KushkiService } from 'src/app/services/kushki.service';

@Component({
  selector: 'app-testotp',
  templateUrl: './testotp.component.html',
  styleUrls: ['./testotp.component.scss'],
})
export class TestotpComponent implements OnInit {

  @Input() secureId: string;
  @Input() secureService: string;
  otpValue: number;
  count = 0;
  
  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private kushkiService: KushkiService,
    private navController: NavController
    ) { }

  ngOnInit() {
   }

  setOtpValue(event) {
    this.otpValue = event.detail.value;
  }

  otpValidate() {
    let kushki = this.kushkiService.initKushki()
    kushki.requestSecureServiceValidation({
      secureServiceId: this.secureId,
      otpValue: this.otpValue
    }, (response) => {
      if (!response.error) {
        this.count = 0;
        this.modalCtrl.dismiss(response)
      } else {
        this.count++;
        if (this.count >= 3) {
          this.count = 0;
          this.modalCtrl.dismiss(response)
        } else {
          this.showToast()
        }
      }
    });
  }

  backButton() {
    this.modalCtrl.dismiss()
    this.navController.back()
  }
  
  async showToast() {

    await this.toastCtrl.create({
      message: `Monto invalido. Vuelve a ingresarlo (${this.count}/3 intentos)`,
      duration: 3000,
      position: 'bottom',
      color: 'lightRedLomi',
      buttons: [{
        text: 'x',
        handler: () => {
          console.log("ok clicked");
        }
      }]
    }).then(res => res.present());
  }

}
