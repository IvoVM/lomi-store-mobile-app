import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Promotions } from '@lomii/lomi-sdk'
import { Utils } from 'src/utils/util';
import { CartService } from '../services/cart.service';
import { PromotionsService } from '../services/promotions.service';

@Component({
  selector: 'app-flexible-promotions-bar',
  templateUrl: './flexible-promotions-bar.component.html',
  styleUrls: ['./flexible-promotions-bar.component.scss'],
})
export class FlexiblePromotionsBarComponent implements OnInit, OnDestroy {

  currentPromotion;
  nextPromotion;
  currentPercent;
  showing = 0;
  shipment = false;
  cartState = 'cart';

  @Input() autohide = true;
  @Output() promotionsToReach = new EventEmitter<boolean>();

  get displayAmountToReach(){
    return this.nextPromotion ? Intl.NumberFormat('en-US').format(this.nextPromotion.amountToReach) : this.nextPromotion;
  }

  ngOnDestroy(): void {
      
  }

  showBar(){
    this.showing += 1;
    const tabsInner:any = document.querySelector('.tabs-inner');
    const tab:any = document.querySelector('ion-tab-bar');
    if(tabsInner?.style.height == '100vh'){
      tab.style.transform = 'translateY(100px)';
      setTimeout(()=>{
        const promotions = document.querySelector('.flexible-promotions-bar:not(.hide)');
        promotions ? promotions["style"].transform = 'translateY(70px)' : null;
        tabsInner.style.contain = 'none';
        tabsInner.style.height = '100vh'
      }, 100)
    }
    setTimeout( ()=> {
      this.showing -= 1;
    }, 2500 )
  }

  constructor(
    private cart:CartService,
    private promotionsService:PromotionsService
  ) { }

  ngOnInit() {
    this.cart.activeCart$.subscribe((activeCart)=>{
      if(!activeCart || (activeCart.data.attributes.state == 'delivery' || activeCart.data.attributes.state == 'payment')){
        return
      }
      if(activeCart.included){
        const address = Utils.getIncluded(activeCart, 'address')
        this.shipment = !address[0].attributes.global
        console.log(address, this.shipment)
      }
      Promotions.getPromotionsOfCart(activeCart.data.attributes).then((res:any)=>{
        const promoReached = this.nextPromotion?.name == res?.currentDeliveryPromotion?.name;
        this.nextPromotion = res.nextPromotion
        this.currentPromotion = res.currentDeliveryPromotion
        if(res.nextPromotion && res.nextPromotion.amountToReach > 100000){
          res.nextPromotion = null;
        }
        if(res.nextPromotion && res.nextPromotion.amountToReach > 0){
          const dfRule = res.nextPromotion.rules.find((rule)=>rule.amount_max)
          if(!dfRule){
            return this.promotionsToReach.emit(false);
          }
          const hundredPercent = dfRule.amount_min
          this.currentPercent = 1 - 1/hundredPercent * res.nextPromotion.amountToReach
          this.showBar();
          this.promotionsToReach.emit(true);
        } else {
          this.promotionsToReach.emit(false);
        }
      });
    })
  }

}
