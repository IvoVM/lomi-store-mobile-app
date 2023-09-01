import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IntercomService } from '../services/intercom.service';
import { ModalsService } from '../services/modals.service';

@Component({
  selector: 'app-avocado-sorry-modal',
  templateUrl: './avocado-sorry-modal.component.html',
  styleUrls: ['./avocado-sorry-modal.component.scss'],
})
export class AvocadoSorryModalComponent implements OnInit {

  constructor(
    private router:Router,
    private modalCtrl:ModalsService,
    private intercom:IntercomService
  ) { }

  goToOrderDetail(){
    this.modalCtrl.dismissTopModal();
  }

  intercomOpen(){
    this.intercom.show("Mi pedido tarda demasiado en validarse");
  }

  ngOnInit() {}

}
