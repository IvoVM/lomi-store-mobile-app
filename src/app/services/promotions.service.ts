import { Injectable } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PromotionsService {

  showingToasts:any = {}

  constructor(
    private toastCtrl:ToastController
  ) {

  }


  async showDeliveryPromotionToast(actualPromotion, nextValue = null, overlay = false){
    if(!this.showingToasts["promotion"] || overlay){
      this.showingToasts["promotion"] = true
      const res = await this.toastCtrl.create({
        header: actualPromotion? "Promocion actual: "+actualPromotion.name: "Sin promocion",
        message: nextValue ? 'Te faltan $' +nextValue.amountToReach.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')+ ' Mas para llegar a ' + nextValue.name : null,
        duration: 100000,
        cssClass: 'customToastClass'
      })
      await res.present()
      this.showingToasts["promotion"] = false;
    }
  }
}
