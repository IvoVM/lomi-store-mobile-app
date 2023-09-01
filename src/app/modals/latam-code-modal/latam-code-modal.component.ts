import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-latam-code-modal',
  templateUrl: './latam-code-modal.component.html',
  styleUrls: ['./latam-code-modal.component.scss'],
})
export class LatamCodeModalComponent implements OnInit {

  latamCode
  
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  dismiss() {
    this.modalCtrl.dismiss(this.latamCode)
  }

  setLatamCode(event) {
    this.latamCode = event.detail.value;
  }
}
