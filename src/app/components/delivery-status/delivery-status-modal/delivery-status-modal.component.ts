import { Component, Input, OnInit } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Router } from '@angular/router';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { LaunchDarklyService } from 'src/app/services/launch-darkly.service';
import { IntercomService } from 'src/app/services/intercom.service';

@Component({
  selector: 'app-delivery-status-modal',
  templateUrl: './delivery-status-modal.component.html',
  styleUrls: ['./delivery-status-modal.component.scss'],
})
export class DeliveryStatusModalComponent implements OnInit {

  @Input() actualOrder: any
  @Input() state: any
  @Input() time: any = 0
  @Input() tokenOrder = ''
  @Input() hoursRange = []
  constructor(
    private iab: InAppBrowser,
    private router: Router,
    private userEventsService: UserEventsService,    
    private ldService: LaunchDarklyService,
    private intercom: IntercomService,
  ) { }

  ngOnInit() {
  }

  async openExternalTracking() {
    if (!this.actualOrder.journeys) return 
    const { uberTrip, uberFourWheelsTrip} = this.actualOrder.journeys
    if (uberTrip) return uberTrip.tracking_url ? this.iab.create(uberTrip.tracking_url, '_system'): null
    if (uberFourWheelsTrip) return uberFourWheelsTrip.tracking_url ? this.iab.create(uberFourWheelsTrip.tracking_url, '_system'): null
  }

  async sendWhatsapp() {
    this.userEventsService.userEvents['customer_service.clicked'].track()
    const chatCondition = await this.ldService.client.variation('chat-customer', false);
    if (chatCondition) {
      this.intercom.show();
    } else {
      this.iab.create('https://wa.me/56942143971?text=Hola%21%20Lomi', '_system')
    }
  }

  goToOrder() {
    this.router.navigate(['/orders', this.actualOrder.number], 
    { queryParams: 
      { order_token: this.tokenOrder } 
    })
  }

}
