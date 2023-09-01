import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-number-phone',
  templateUrl: './number-phone.component.html',
  styleUrls: ['./number-phone.component.scss'],
})
export class NumberPhoneComponent implements OnInit {

  number

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  dismiss() {
    this.modalCtrl.dismiss(this.number)
  }

  setNumberPhone(event) {
    this.number = event.detail.value;
  }
}
