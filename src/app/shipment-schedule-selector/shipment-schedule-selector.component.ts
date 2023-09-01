import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { ModalsService } from '../services/modals.service';

@Component({
  selector: 'app-shipment-schedule-selector',
  templateUrl: './shipment-schedule-selector.component.html',
  styleUrls: ['./shipment-schedule-selector.component.scss'],
})
export class ShipmentScheduleSelectorComponent implements OnInit {

  constructor(public cart:CartService, public modalsService:ModalsService) { }

  ngOnInit() {}

}
