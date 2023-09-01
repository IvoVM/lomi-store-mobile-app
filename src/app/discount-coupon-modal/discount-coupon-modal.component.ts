import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSearchbar, ModalController } from '@ionic/angular';
import { CartService } from '../services/cart.service';
import { SecurityProvider } from '../services/security.service';
import { UserEventsService } from '../user-events/user-events.service';

@Component({
  selector: 'app-discount-coupon-modal',
  templateUrl: './discount-coupon-modal.component.html',
  styleUrls: ['./discount-coupon-modal.component.scss'],
})
export class DiscountCouponModalComponent implements OnInit {

  promotionCode = "";

  constructor(
    private modalCtr:ModalController,
    private cartService:CartService,
    private securityProvider:SecurityProvider,
    private userEventsService: UserEventsService,
  ) { }

  ngOnInit() {
    setTimeout(()=>{
      const promoInput:any = document.getElementById("promo-input")
      promoInput.setFocus();
    },700)
  }

  dismiss(){
    this.modalCtr.dismiss()
    this.applyCouponCode(this.promotionCode)
  }

  async applyCouponCode(data, showToast = true) {
    this.userEventsService.userEvents['coupon.applied'].track({
      coupon_code : data
    });
    if (!data) return
    const orderToken = await this.cartService.orderToken();
    console.log(orderToken)

    if (!data.cupon_code) {
      data = {
        coupon_code: data,
        include: 'line_items,variants,variants.product.images,variants.images,billing_address,shipping_address,user,payments,shipments,promotions'
      }
    }
    const response = await this.securityProvider.getClient().cart.applyCouponCode(orderToken, data);
    if (!response.isFail()) {
      await this.cartService.setActiveCart(response.success())
      if (showToast) {
        this.cartService.showToast("Codigo promocional " + data.coupon_code + " aplicado", "primary")
      }
    } else {
      if (showToast) {
        this.cartService.showToast(response.fail().summary)
      }
    }
    return response;
  }

}
