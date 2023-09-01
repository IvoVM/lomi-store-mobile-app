import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { CartService } from '../services/cart.service';
import { CheckoutService } from '../services/checkout.service';
import { UserEventsService } from '../user-events/user-events.service';

@Component({
  selector: 'app-modal-confirm-pay',
  templateUrl: './modal-confirm-pay.component.html',
  styleUrls: ['./modal-confirm-pay.component.scss'],
})
export class ModalConfirmPayComponent implements OnInit {

  public maxRetries = 4;

  constructor(
    private checkoutService:CheckoutService,
    private router: Router,
    private modalCtrl: ModalController,
    private userEvents: UserEventsService,
  ) { }

  ngOnInit() {
    this.confirmIfCompleted()
    this.userEvents.userEvents['order_waiting.loaded'].track()
  }

  async confirmIfCompleted(retry = 1){
    let orderCompleted = await this.checkoutService.confirmOrderCompleted()
    if(orderCompleted){
      this.modalCtrl.dismiss({
        orderCompleted : true
      })
      return;
    }

    if(retry < this.maxRetries){
      setTimeout(()=>{
        this.confirmIfCompleted(retry + 1)
      },7000)
    } else {
      this.modalCtrl.dismiss({
        orderCompleted : false
      })
    }
  }

}
