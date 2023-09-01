import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-login',
  templateUrl: './modal-login.component.html',
  styleUrls: ['./modal-login.component.scss'],
})
export class ModalLoginComponent implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  async dismiss() {
    await this.modalCtrl.dismiss();
  }

}
