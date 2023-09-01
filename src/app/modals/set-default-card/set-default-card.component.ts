import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-set-default-card',
  templateUrl: './set-default-card.component.html',
  styleUrls: ['./set-default-card.component.scss'],
})
export class SetDefaultCardComponent implements OnInit {

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
