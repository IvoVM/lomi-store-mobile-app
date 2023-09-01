import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-error-message-modal',
  templateUrl: './error-message-modal.component.html',
  styleUrls: ['./error-message-modal.component.scss'],
})
export class ErrorMessageModalComponent implements OnInit {

  @Input() title: string = 'Algo salió mal...';
  @Input() subTitle: string = 'Por favor, vuelve a intentarlo';

  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.modalCtrl.dismiss().then(() => {
        this.navCtrl.navigateBack('/tabs/home')
      })
    }, 4000);
  }

  backButton() {
    this.modalCtrl.dismiss()
    this.navCtrl.back()
  }
}
