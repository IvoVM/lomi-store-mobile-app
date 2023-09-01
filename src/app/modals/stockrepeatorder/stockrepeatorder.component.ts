import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-stockrepeatorder',
  templateUrl: './stockrepeatorder.component.html',
  styleUrls: ['./stockrepeatorder.component.scss'],
})
export class StockrepeatorderComponent implements OnInit {

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.modalCtrl.dismiss()
    }, 5000);
  }

}
