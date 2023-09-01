import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-discount-modal',
  templateUrl: './add-discount-modal.component.html',
  styleUrls: ['./add-discount-modal.component.scss'],
})
export class AddDiscountModalComponent implements OnInit {

  promotionCode
  
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  dismiss() {
    this.modalCtrl.dismiss(this.promotionCode)
  }

  setPromotionCode(event) {
    this.promotionCode = event.detail.value;
  }
}
