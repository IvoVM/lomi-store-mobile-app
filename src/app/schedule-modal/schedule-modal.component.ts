import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-schedule-modal',
  templateUrl: './schedule-modal.component.html',
  styleUrls: ['./schedule-modal.component.scss'],
})
export class ScheduleModalComponent implements OnInit {

  constructor(private modalCtrl:ModalController, private cartService:CartService) { }

  dismiss(){
    this.modalCtrl.dismiss()
  }

  setNow(){
    this.cartService.when = "Ahora"
    this.dismiss()
  }

  setTomorrow(){
    this.cartService.when = "Mañana"
    this.dismiss()
  }

  ngOnInit() {}

}
