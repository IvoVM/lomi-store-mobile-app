import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-success-message-modal',
  templateUrl: './success-message-modal.component.html',
  styleUrls: ['./success-message-modal.component.scss'],
})
export class SuccessMessageModalComponent implements OnInit {
  @Input() title: string;
  @Input() subTitle: string;

  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.modalCtrl.dismiss().then(() => {
        this.navCtrl.back()
      })
    }, 4000);
  }

}
