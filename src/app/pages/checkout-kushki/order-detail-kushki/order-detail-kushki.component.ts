import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { delay } from 'rxjs/operators';
import { AddDiscountModalComponent } from 'src/app/modals/add-discount-modal/add-discount-modal.component';
import { LatamCodeModalComponent } from 'src/app/modals/latam-code-modal/latam-code-modal.component';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { SecurityProvider } from 'src/app/services/security.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { Utils } from 'src/utils/util';

@Component({
  selector: 'app-order-detail-kushki',
  templateUrl: './order-detail-kushki.component.html',
  styleUrls: ['./order-detail-kushki.component.scss'],
})
export class OrderDetailKushkiComponent implements OnInit {

 @Input() refreshing:boolean = false;

  private cart;
  private allowMultiplePromotions = 0; //set inputs of promotions
  public shipments = [];
  public shipmentPromotion:any = null;
  public shipmentDeduced = 0;
  amount = 0;
  promotionCode;
  latamCode;

  promotionButton(promotionInput){
    if(promotionInput.sent){
      promotionInput.delete(promotionInput)
    } else if(!promotionInput.active){
      promotionInput.active = true
    } else if(promotionInput.value){
      promotionInput.function(promotionInput)
    } else {
      promotionInput.active = false;
    }
  }


  public toPrettyNumber(number){
    let stringNumber = "" + number;
    let prettyNumber =  ""
    for(var digitIndex in number){
      prettyNumber+= number[digitIndex]
      if(+digitIndex % 3 == 0) prettyNumber += "."  
    }
    return prettyNumber
  }


  constructor(
    private securityProvider:SecurityProvider, 
    private nativeStorage:Storage, 
    private userEventsService: UserEventsService,
    public checkoutService:CheckoutService, 
    public cartService:CartService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private security: SecurityProvider
    ) {

    this.cartService.activeCart$.subscribe(activeCart=>{
      this.cart = activeCart
      if (this.cart.data.attributes.latam_code) {
        this.latamCode = this.cart.data.attributes.latam_code
      }
      if(this.promotions.length){
        for( var promo of this.promotions){
          this.promotionCode = promo.code
        }
      }
      this.shipments = Utils.getIncluded(this.cart,'shipment')
      this.shipmentPromotion = Utils.getIncluded(this.cart,'promotion').find(promo=>promo.attributes.name.includes('Envío'))
      this.shipmentDeduced = this.shipmentPromotion ? parseInt(this.cart.data.attributes.ship_total) + parseInt(this.shipmentPromotion.attributes.amount) : 0
      console.log(this.shipments, this.shipmentPromotion)
    })

    this.cartService.getActiveCart$().subscribe(cart => {
      if (cart) this.amount = cart.data.attributes.item_count
    });
  }

  get errors(){
    return ""
  }

  get details(){
    return this.cart?.data.attributes
  }
  
  get addressData(){
    return Utils.getIncluded(this.cart,'address')[0]
  }

  get promotions(){
    let promo = this.cart?.included[this.allowMultiplePromotions ? "filter" : "find"]((include)=>{
      return include.type == 'promotion' && include.attributes.code
    })
    let returnedPromo = this.allowMultiplePromotions ? promo.map(promo=>promo.attributes) : promo ? [promo.attributes] : []
    return returnedPromo
  }


  ngOnInit() {
  }

  async openDiscountModal() {
    const modal = await this.modalCtrl.create({
      component: AddDiscountModalComponent,
      canDismiss: true,
      cssClass: 'add-discount-modal',
    })
    await modal.present();
    let { data } = await modal.onWillDismiss()
    console.log(data)
    this.applyCoupon(data)
  }

  async openLatamCodeModal() {
    const modal = await this.modalCtrl.create({
      component: LatamCodeModalComponent,
      canDismiss: true,
      cssClass: 'add-discount-modal',
    })
    await modal.present();
    let { data } = await modal.onWillDismiss()
    this.latamCode = data
    this.applyLatamCode(this.latamCode);
  }

  applyCoupon(code) {
    this.cartService.applyCouponCode({
      coupon_code: code
    }).then(async (res)=>{
      if(res.isSuccess()){
        this.promotionCode = code
        if (code) {
          this.userEventsService.userEvents['coupon.applied'].track({
            coupon_code: code
          })
        }
      } else {
        this.promotionCode = ''
        this.showToast('No se pudo aplicar el cupón')
        setTimeout(()=>{
        }, 5000)
      }
    })
  }

  removeCoupon() {
    this.promotionCode = '';
    this.cartService.removeCouponCode(this.promotionCode).then((res)=>{
      if(res.isSuccess()){
        this.promotionCode = '';
      } else {
        this.showToast('No se eliminar aplicar el cupón')
      }
    })
  }

  async applyLatamCode(latamCode) {
    await this.nativeStorage.set('latam_code', {
      latam_code: latamCode,
      user_id: this.securityProvider.getUserData().data.id
    }).then(()=>{
      this.checkoutService.latamCode = latamCode
      this.checkoutService.updateOrderLatamCode();
      if (latamCode) {
        this.userEventsService.userEvents.latam_code.track({
          'email': this.security.getUserData().data.attributes.email,
          'latam_code': latamCode
        })
      }
    })
  }

  async removeLatamCode() {
    this.latamCode = ''
    this.applyLatamCode('').then(()=>{
      this.checkoutService.latamCode = ''
      this.checkoutService.updateOrderLatamCode()
    })
  }

  async showToast(message, color = 'danger') {
    await this.toastCtrl.create({
      message: message,
      duration: 5000,
      position: 'bottom',
      cssClass: 'toast-error',
      color: color, //danger
      buttons: [{
        text: 'OK',
        handler: () => {
          console.log("ok clicked");
        }
      }]
    }).then(res => res.present());
  }


}
