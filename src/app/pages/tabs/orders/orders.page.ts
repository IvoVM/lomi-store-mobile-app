import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-orders-page',
  templateUrl: 'orders.page.html',
  styleUrls: ['orders.page.scss']
})
export class OrdersPage {
  reachBottom = new BehaviorSubject(false);

  constructor() {
  }

  async logScrolling($event) {
    if ($event.target.localName != "ion-content") {
      return;
    }

    const scrollElement = await $event.target.getScrollElement();
    const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;
    const currentScrollDepth = $event.detail.scrollTop;
    const targetPercent = 80;
    let triggerDepth = ((scrollHeight / 100) * targetPercent);

    if (currentScrollDepth > triggerDepth) {
      this.reachBottom.next(true);
    }
  }
}
