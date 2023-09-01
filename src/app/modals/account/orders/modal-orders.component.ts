import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-orders',
  templateUrl: './modal-orders.component.html',
  styleUrls: ['./modal-orders.component.scss'],
})
export class ModalOrdersComponent implements OnInit {

  constructor(private modalCtrl: ModalController) {
  }

  ngOnInit() {
  }

  async dismiss() {
    await this.modalCtrl.dismiss();
  }

}
