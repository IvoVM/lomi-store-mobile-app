import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { CheckoutService } from '../services/checkout.service';

@Component({
  selector: 'app-direction-confirmation',
  templateUrl: './direction-confirmation.component.html',
  styleUrls: ['./direction-confirmation.component.scss'],
})
export class DirectionConfirmationComponent implements OnInit {

  constructor(private router:Router, private modalsCtrl:ModalController, private checkout:CheckoutService) { }

  confirm(){
    this.modalsCtrl.dismiss(true)
  }
  cancel(){
    this.modalsCtrl.dismiss(false)
  }

  ngOnInit() {}

}
