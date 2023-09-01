import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ProductDetailComponent } from '../components/product/product-detail/product-detail.component';
import { ModalProductComponent } from '../modals/product/modal-product.component';
import { Platform } from '@ionic/angular';
import { NoStockDialogComponent } from '../no-stock-dialog/no-stock-dialog.component';
import { DirectionConfirmationComponent } from '../direction-confirmation/direction-confirmation.component';
import { ModalCartComponent } from '../modals/cart/modal-cart.component';
import { ScheduleModalComponent } from '../schedule-modal/schedule-modal.component';
import { ModalConfirmPayComponent } from '../modal-confirm-pay/modal-confirm-pay.component';
import { RecoverPasswordMessageComponent } from '../modals/recover-password-message/recover-password-message.component';
import { ProcesingDataComponent } from '../modals/procesing-data/procesing-data.component';
import { ErrorMessageModalComponent } from '../modals/error-message-modal/error-message-modal.component';
import { SuccessMessageModalComponent } from '../modals/success-message-modal/success-message-modal.component';
import { CheckoutNoteComponent } from '../modals/checkout-note/checkout-note.component';
import { SetDefaultCardComponent } from '../modals/set-default-card/set-default-card.component';
import { RedirectWebpayComponent } from '../modals/redirect-webpay/redirect-webpay.component';
import { DeleteAddressModalComponent } from '../modals/delete-address-modal/delete-address-modal.component';

import { AvocadoSorryModalComponent } from '../avocado-sorry-modal/avocado-sorry-modal.component';
import { UserLocationModalComponent } from '../user-location-modal/user-location-modal.component';
import { CountySelectorModalComponent } from '../county-selector-modal/county-selector-modal.component';
import { DiscountCouponModalComponent } from '../discount-coupon-modal/discount-coupon-modal.component';
import { UpsellingComponent } from '../upselling/upselling.component';
import { StockrepeatorderComponent } from '../modals/stockrepeatorder/stockrepeatorder.component';
import { LomiboxModalComponent } from '../modals/lomibox-modal/lomibox-modal.component';
import { LomiboxCategoryModalComponent } from '../modals/lomibox-category-modal/lomibox-category-modal.component';
import { RecepyModalComponent } from '../modals/recepy-modal/recepy-modal.component';
import { UserEventsService } from '../user-events/user-events.service';
@Injectable({
  providedIn: 'root'
})
export class ModalsService {

  //MODALS DEFINITION TO JUST HAVE THE CORRECT VALUE OPENED

  public noStockModal:HTMLIonModalElement = null;
  public changeDirectionModal:HTMLIonModalElement = null;
  public cartModal:HTMLIonModalElement | boolean = null;
  public timeOutModal = false;

  public recoverPasswordMessage:HTMLIonModalElement = null;
  public procesingData:HTMLIonModalElement = null;
  public errorMessageModal:HTMLIonModalElement = null;
  public successMessageModal:HTMLIonModalElement = null;
  public checkoutNoteModal :HTMLIonModalElement = null;
  public setDefaultCard :HTMLIonModalElement = null;
  public redirectToWebapy :HTMLIonModalElement = null;
  public deleteAddressModal:HTMLIonModalElement = null;
  public noOnStockRepeatOrder:HTMLIonModalElement = null;
  public lomiBoxModal:HTMLIonModalElement = null;
  public lomiBoxCategoryModal:HTMLIonModalElement = null;
  public lomiRecepies:HTMLIonModalElement = null;

  async openProduct(product, dismiss = true) {
    this.productModal(product, dismiss)
    return
  }

  async openDiscountModal(){
    this.openModal(DiscountCouponModalComponent, {}, false, 'input-modal')
  }

  async orderTimeoutModal(){
    if(!this.timeOutModal){
      this.timeOutModal = true;
      let modal = this.openModal(AvocadoSorryModalComponent,{},false,'full-modal');
      (await modal).onDidDismiss()
      this.timeOutModal = false;
    }
  }

  async userLocationModal(){
    return await this.openModal(UserLocationModalComponent, {}, false, 'modal-on-center', false)
  }

  async openSelectorCountyModal(){
    return await this.openModal(CountySelectorModalComponent, {}, false, 'full-modal')
  }

  async scheduleModal(){
    this.openModal(ScheduleModalComponent,{}, false, 'schedule-modal')
  }

  async productModal(product, dismiss = true) {
    this.openModal(ModalProductComponent, {product}, dismiss)
  }

  async upsellingModal(){
    return this.openModal(UpsellingComponent, {}, false, 'modal-85vh')
  }

  async confirmOrderCompletedModal(){
    return this.openModal(ModalConfirmPayComponent, {}, true, "full-modal")
  }

  async noStockDialog(dismiss = false, modalClass = "stock-dialog"){
    if(this.noStockModal)return;
    this.noStockModal = await this.openModal(NoStockDialogComponent, {}, dismiss, modalClass)
    this.noStockModal.onDidDismiss().then(()=>{
      this.noStockModal = null;
    })
    return this.noStockModal
  }
 
  async changeDirectionDialog(dismiss = false, modalClass = "change-direction-warning-dialog"){
    console.log("What")
    this.changeDirectionModal =  await this.openModal(DirectionConfirmationComponent, {}, dismiss, modalClass)
    this.changeDirectionModal.onDidDismiss().then(()=>{
      this.changeDirectionModal = null;
    })
    return this.changeDirectionModal
  }
  
  async recoverPasswordDialog(dismiss = false, modalClass = 'recover-password-message') {
    this.recoverPasswordMessage =  await this.openModal(RecoverPasswordMessageComponent, {}, dismiss, modalClass)
    this.recoverPasswordMessage.onDidDismiss().then(()=>{
      this.recoverPasswordMessage = null;
    })
    return this.recoverPasswordDialog
  }

  async openCheckOutNoteModal(dismiss = false, modalClass = 'checkout-note') {
    this.checkoutNoteModal =  await this.openModal(CheckoutNoteComponent, {}, dismiss, modalClass)
    this.checkoutNoteModal.onDidDismiss().then(()=>{
      this.checkoutNoteModal = null;
    })
    return this.openCheckOutNoteModal
  }

  async openProcesingData(props, dismiss = false, modalClass = "cart-modal") {
    this.procesingData = await this.openModal(ProcesingDataComponent, props, dismiss, modalClass)
    this.procesingData.onDidDismiss().then(() => {
      this.procesingData = null
    })
    return this.procesingData
  }

  async openErrorMessageModal(props?, dismiss = false, modalClass = "error-message-modal") {
    this.errorMessageModal = await this.openModal(ErrorMessageModalComponent, props, dismiss, modalClass)
    this.errorMessageModal.onDidDismiss().then(() => {
      this.errorMessageModal = null
    })
    return this.errorMessageModal
  }

  async openSuccessMessageModal(props, dismiss = false, modalClass = "success-message-modal") {
    this.successMessageModal = await this.openModal(SuccessMessageModalComponent, props, dismiss, modalClass)
    this.successMessageModal.onDidDismiss().then(() => {
      this.successMessageModal = null
    })
    return this.successMessageModal
  }

  async openLomiBoxModal(props, dismiss = false, modalClass = "lomi-box-modal") {
    this.lomiBoxModal = await this.openModal(LomiboxModalComponent, props, dismiss, modalClass)
    this.lomiBoxModal.onDidDismiss().then(() => {
      this.lomiBoxModal = null
    })
    return this.lomiBoxModal
  }

  async openLomiBoxCategoryModal(props, dismiss = false, modalClass = "lomi-box-category-modal") {
    this.lomiBoxCategoryModal = await this.openModal(LomiboxCategoryModalComponent, props, dismiss, modalClass)
    this.lomiBoxCategoryModal.onDidDismiss().then(() => {
      this.lomiBoxCategoryModal = null
    })
    return this.lomiBoxCategoryModal
  }
  async openLomiRecepyModal(props, dismiss = false, modalClass = "lomi-box-category-modal") {
    this.lomiRecepies = await this.openModal(RecepyModalComponent, props, dismiss, modalClass)
    this.lomiRecepies.onDidDismiss().then(() => {
      this.lomiRecepies = null
    })
    return this.lomiRecepies
  }

  async deleteAddress(addressId, dismiss = false, modalClass = 'delete-address-modal') {
    this.deleteAddressModal =  await this.openModal(DeleteAddressModalComponent, {addressId}, dismiss, modalClass)
    this.deleteAddressModal.onDidDismiss().then(()=>{
      this.deleteAddressModal = null;
    })
    return this.deleteAddressModal
  }

  async openCart(dismiss = false, modalClass = "cart-modal", force=false, componentProps = {}){
    if(!this.cartModal || force){
      this.cartModal = true;
      this.cartModal =  await this.openModal(ModalCartComponent, {
        ...componentProps
      }, dismiss, modalClass)
      this.cartModal.onDidDismiss().then(()=>{
        this.cartModal = null;
      })
    }
    return this.cartModal
  }

  async openSetDefaultCard(dismiss = false, modalClass = "set-default-card"){
    this.setDefaultCard =  await this.openModal(SetDefaultCardComponent, {}, dismiss, modalClass)
    this.setDefaultCard.onDidDismiss().then(()=>{
      this.setDefaultCard = null;
    })
    return this.setDefaultCard
  }

  async openRedirectToWebpay(dismiss = false, modalClass = "redirect-to-webpay"){
    this.setDefaultCard =  await this.openModal(RedirectWebpayComponent, {}, dismiss, modalClass)
    this.setDefaultCard.onDidDismiss().then(()=>{
      this.setDefaultCard = null;
    })
    return this.setDefaultCard
  }

  async openStockRepeatOrder(dismiss = false, modalClass = "stock-repeat-order-modal"){
    this.noOnStockRepeatOrder =  await this.openModal(StockrepeatorderComponent, {}, dismiss, modalClass)
    this.noOnStockRepeatOrder.onDidDismiss().then(()=>{
      this.noOnStockRepeatOrder = null;
    })
    return this.noOnStockRepeatOrder
  }

  async throwUnexpectedError(){
    this.openErrorMessageModal()
  }


  async openModal(component, props = {}, dismiss = true, modalClass = "modal-class", backdropDismiss = true) {
    this.userEventsService.userEvents['componentName_modal.opened'].track(component.name)
    if(await this.modalCtrl.getTop() && dismiss){
      this.modalCtrl.dismiss()
    }

    const modal = await this.modalCtrl.create({
      component: component,
      canDismiss: true,
      cssClass: modalClass,
      componentProps: props,
      backdropDismiss
    })
    await modal.present();
    return modal
  }

  async dismissTopModal(){
    return this.modalCtrl.dismiss()
  }


  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private platform: Platform,
    private userEventsService: UserEventsService,
  ) {}
}
