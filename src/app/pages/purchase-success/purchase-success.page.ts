import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-purchase-success',
  templateUrl: './purchase-success.page.html',
  styleUrls: ['./purchase-success.page.scss'],
})
export class PurchaseSuccessPage implements OnInit {

  constructor() { }

  ngOnInit() {
    window.analytics.page('purchase-success');
  }

}
