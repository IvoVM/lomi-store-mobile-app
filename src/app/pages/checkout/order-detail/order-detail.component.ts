import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { IonInput } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { delay } from 'rxjs/operators';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { SecurityProvider } from 'src/app/services/security.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { Utils } from 'src/utils/util';
@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {

  @Input() refreshing:boolean = false;
  @ViewChild('latam_code') latamInput: IonInput

  private cart;
  public shipments = [];


  applyCoupon = async (promotionInput)=>{
    promotionInput.sent = true;
    promotionInput.active = true;
    this.cartService.applyCouponCode({
      coupon_code: promotionInput.value
    }).then(async (res)=>{
      if(res.isSuccess()){
        promotionInput.sent = true;
      } else {
        promotionInput.error = "No se pudo aplicar el cupón"
        setTimeout(()=>{
          promotionInput.error = ""
        }, 5000)
        promotionInput.sent = false;
      }
    })
  }

  removeCoupon = (promotionInput) =>{
    this.cartService.removeCouponCode(promotionInput.value).then((res)=>{
      if(res.isSuccess()){
        promotionInput.sent = false;
        promotionInput.active = false;
        promotionInput.value = "Coca cola"
      } else {
        promotionInput.error = "No se pudo eliminar el cupon"
        setTimeout(()=>{
          promotionInput.error = ""
        }, 5000)
        promotionInput.sent = false;
        promotionInput.value = "";
        promotionInput.active = false;
      }
    })
  }

  //Customized Coupon Input
  applyLatamCode = async (promotionInput)=>{
    await this.nativeStorage.set('latam_code', {
      latam_code: promotionInput?.value,
      user_id: this.securityProvider.getUserData().data.id
    }).then(async ()=>{
      this.checkoutService.latamCode = promotionInput?.value
      this.cartService.loadingCart$.next(true)
      let res = await this.checkoutService.updateOrderLatamCode();
      this.cartService.loadingCart$.next(false)
      if(res.isFail()){
        this.latamInput.value = ""
      }
      this.promotionsInput.latamCodeInput.sent = promotionInput != null;
      this.promotionsInput.latamCodeInput.active = promotionInput != null;
    })
  }

  removeLatamCode = (latamCodeInput) =>{
    this.applyLatamCode(null).then(()=>{
      this.promotionsInput.latamCodeInput.active = false;
      this.promotionsInput.latamCodeInput.sent = false;
      this.promotionsInput.latamCodeInput.value = ""
      this.checkoutService.updateOrderLatamCode()
    })
  }

  promotionsInput = {
    promotionCodeInput :{
      value: "",
      sent: false,
      active: false,
      color: 'primary',
      name: "Código promocional",
      placeholder: "Ingrese su código promocional",
      error: "",
      icon: "",
      function: this.applyCoupon,
      delete: this.removeCoupon,
    },
    latamCodeInput :{
      value: "",
      sent: false,
      active: false,
      color: 'tertiary',
      placeholder: "N° de socio de socio LATAM Pass",
      name: "Acumula millas ",
      error: "",
      icon: "latam",
      function: this.applyLatamCode,
      delete: this.removeLatamCode,
    }
  }

  inputs = [
    this.promotionsInput.latamCodeInput
  ]

  promotionButton(promotionInput){
    if(promotionInput.sent){
      promotionInput.delete(promotionInput)
    } else if(!promotionInput.active){
      promotionInput.active = true
      this.latamInput.setFocus();
      
      document.querySelector('#latam_code_input').scrollIntoView({
        behavior: 'smooth'
      });
    } else if(promotionInput.value){
      promotionInput.function(promotionInput)
    } else {
      promotionInput.active = false;
    }
  }

  async getLatamCode(){
    this.nativeStorage.get('latam_code').then((latamCode)=>{
      if(latamCode && latamCode.user_id == this.securityProvider.getUserData().data.id){
        this.promotionsInput.latamCodeInput.active = latamCode.latam_code != null;
        this.promotionsInput.latamCodeInput.sent = latamCode.latam_code != null;
        this.promotionsInput.latamCodeInput.value = latamCode.latam_code ? latamCode.latam_code : ""
        this.checkoutService.latamCode = latamCode.latam_code
        if(latamCode.latam_code){
          this.checkoutService.updateOrderLatamCode()
        }
      }
    })
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
    private userEventsService: UserEventsService,
    private securityProvider:SecurityProvider, private nativeStorage:Storage, public checkoutService:CheckoutService, public cartService:CartService) {


    this.getLatamCode();
    cartService.activeCart$.subscribe(activeCart=>{
      this.cart = activeCart
      this.inputs = [ 
        this.promotionsInput.latamCodeInput
      ]

      /**if(this.promotions.length){
        for( var promo of this.promotions){
          this.inputs.unshift({
            ...this.promotionsInput.promotionCodeInput,
            value: promo.code,
            sent: true,
            active: true,
          })
        }
      } else {
        this.inputs.unshift({...this.promotionsInput.promotionCodeInput})
      }
      this.inputs.sort((input1, input2)=>{
        return +input1.active - +input2.active
      })**/
    })
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
    let promo = this.cart?.included.filter((include)=>{
      return include.type == 'promotion'
    })
    let returnedPromo = promo.map(promo=>promo.attributes)
    return returnedPromo
  }

  ngOnInit() {
    this.userEventsService.userEvents['order_details.loaded'].track()
  }

}