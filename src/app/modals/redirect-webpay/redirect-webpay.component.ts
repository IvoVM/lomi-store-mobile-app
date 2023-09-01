import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-redirect-webpay',
  templateUrl: './redirect-webpay.component.html',
  styleUrls: ['./redirect-webpay.component.scss'],
})
export class RedirectWebpayComponent implements OnInit {

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  confirm(){
    this.modalCtrl.dismiss(true)
  }
  cancel(){
    this.modalCtrl.dismiss(false)
  }

}
