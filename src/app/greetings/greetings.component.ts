import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { CheckoutService } from '../services/checkout.service';
import { LaunchDarklyService } from '../services/launch-darkly.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-greetings',
  templateUrl: './greetings.component.html',
  styleUrls: ['./greetings.component.scss'],
})
export class GreetingsComponent implements OnInit {

  @Input() lightgreenVariant = false;

  orderToken;
  orderNumber;
  backbutton;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private platform: Platform,
    private checkoutService: CheckoutService,
    private ldService: LaunchDarklyService,
    private nativeStorage: Storage
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.orderNumber = params.number
      this.orderToken = params.token
    });
    // this.orderToken = this.route.snapshot.queryParams.orderToken
    // this.orderNumber = this.route.snapshot.queryParams.orderNumber
    // console.log('## GREETINGS',this.orderToken,this.orderNumber, this.route.snapshot)
    setTimeout(() => {
      this.goToOrder()
    }, 5000);

  }

  // goToOrder() {
  //   this.router.navigate(['/tabs/orders']).then(() => {
  //     this.checkoutService.releaseCart()
  //   })
  // }

  ionViewDidEnter() {
    this.backbutton = this.platform.backButton.observers.pop();
  }

  ionViewWillLeave() {
    this.platform.backButton.observers.push(this.backbutton);
  }

  goToHome() {
    this.router.navigate(['/tabs/home'])
  }

  goToOrder() {
    this.router.navigate(['/orders', this.orderNumber],
      {
        replaceUrl: true,
        queryParams: {
          order_token: this.orderToken,
          complete: true,
          hide_repeat_order: true,
        }
      }).then(async () => {
        await this.checkoutService.releaseCart()
      })
  }

}
