import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonSlides, ModalController, NavController } from '@ionic/angular';
import { KushkiService } from 'src/app/services/kushki.service';
import { ModalsService } from 'src/app/services/modals.service';
import { SecurityProvider } from 'src/app/services/security.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { TestotpComponent } from './testotp/testotp.component';

@Component({
  selector: 'app-new-payment-card',
  templateUrl: './new-payment-card.page.html',
  styleUrls: ['./new-payment-card.page.scss'],
})
export class NewPaymentCardPage implements OnInit {

  @ViewChild('mySlides') slides: IonSlides;
  @ViewChild('rotateCard', { static: false }) rotateCard: ElementRef
  slideOpts = {
    initialSlide: 0,
    speed: 500,
    spaceBetween: 15,
    allowTouchMove: false
  };
  isEnd = false;
  isFirst = true;
  paymentCardForm: FormGroup;
  number = '';
  expireAt = '';
  brand = '';
  constructor(
    private navCtrl: NavController,
    public formBuilder: FormBuilder,
    private kushkiService: KushkiService,
    private renderer: Renderer2,
    private modalService: ModalsService,
    private modalCtrl: ModalController,
    private userEventsService: UserEventsService,
    private securityProvder: SecurityProvider
  ) {
  }

  ngOnInit() {
    this.paymentCardForm = this.formBuilder.group({
      numberCard: ['', [Validators.required, Validators.max(9999999999999999)]],
      fullName: ['', [Validators.required]],
      expireAt: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)]],
      CVV: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]]
    })
  }

  goBack() {
    this.navCtrl.back()
  }

  async slideChanged() {
    this.isFirst = await this.slides.isBeginning()
    this.isEnd = await this.slides.isEnd()
  }

  async registerCard() {
    try {
      if (!this.paymentCardForm.valid) return
      let expireAt = this.paymentCardForm.controls.expireAt.value
      let expire = expireAt.split('/')
      let numberOfCard = this.paymentCardForm.controls.numberCard.value.toString();
      let card = {
        name: this.paymentCardForm.controls.fullName.value,
        number: numberOfCard,
        cvc: this.paymentCardForm.controls.CVV.value,
        expiryMonth: expire[0],
        expiryYear: expire[1]
      }
      this.modalService.openProcesingData({title: 'Estamos validando tu tarjeta...',})
      let kushki = this.kushkiService.initKushki()
      kushki.requestSubscriptionToken({
        currency: "CLP",
        card
      }, async (response) => {
        if (response.secureId && response.secureService) {
          this.modalCtrl.dismiss()
          let otpResponse = await this.openOTPModal(response.secureId, response.secureService);
          if (otpResponse.message == 'ok') {
            this.modalService.openProcesingData({title: 'Estamos validando tu tarjeta...',})
            this.registerCardInBackEnd(numberOfCard, expire, response)
          } else {
            this.modalService.openErrorMessageModal({title: 'No hemos podido validar tu tarjeta'}) 
          }
        }
        else if (!response.code){
          this.registerCardInBackEnd(numberOfCard, expire, response)
        } else {
          this.modalCtrl.dismiss()
          this.modalService.openErrorMessageModal()
        }
      });
    } catch (error) {
      this.modalCtrl.dismiss()
      this.modalService.openErrorMessageModal()
    }

  }

  registerCardInBackEnd(numberOfCard, expire, response) {
    try {
      let cardToBackend = {
        provider: this.brand.toLocaleLowerCase(),
        name: this.paymentCardForm.controls.fullName.value,
        cc_type: 'credit',
        last_digits: numberOfCard.substring(numberOfCard.length - 4),
        month: expire[0],
        year: expire[1],
        kushki_token: response.token
      }
      this.kushkiService.registerCreditCard(cardToBackend).subscribe(resp => {
        console.log(resp)
        if (resp['status'] !== 'ok') {
          this.userEventsService.userEvents['error_credit_card.loaded'].track({
            message: resp
          })
          this.modalCtrl.dismiss()
          this.modalService.openErrorMessageModal({ subTitle: resp['error']})
        } else {
          
          this.userEventsService.userEvents['credit_card_confirmation.loaded'].track()
          this.modalCtrl.dismiss()
          this.modalService.openSuccessMessageModal({
            title: `¡Listo! <br>Registramos tu tarjeta <br>con éxito`,
            subTitle: `El monto que cobramos para registrarla será devuelto de inmediato.`
          })
          this.modalCtrl.dismiss()
        }
      }, err => {
        this.modalCtrl.dismiss()
        this.modalService.openErrorMessageModal()
      })
    } catch (error) {
      this.modalCtrl.dismiss()
      this.modalService.openErrorMessageModal()
    }
   
  }

  async openOTPModal(secureId, secureService) {

    const modal = await this.modalCtrl.create({
      component: TestotpComponent,
      canDismiss: false,
      keyboardClose: false,
      componentProps: {
        secureId: secureId,
        secureService: secureService
      }
    });
    await modal.present();
    let { data } = await modal.onWillDismiss()
    return data
  }

  expireAtFormat(event) {
    let { data } = event.detail
    this.expireAt += data
    if (data === null) {
      this.expireAt = this.expireAt.substring(0, this.expireAt.length -5)
    } else  if (this.expireAt.length === 2) {
      this.expireAt += '/'
    } 
      return this.expireAt
    }
  
    async validateCard() {
      const { value } = this.paymentCardForm.controls.numberCard
      let number = value.toString()
      let visa = /^(?:4[0-9]{12}(?:[0-9]{3})?)$/;
      let masterCard = /^(?:5[1-5][0-9]{14})$/;
      if (this.paymentCardForm.controls.numberCard.errors) {
      } else if (number.match(visa)) {
        this.brand = 'VISA'
        this.slides.slideNext()
      } else if (number.match(masterCard)) {
        this.brand = 'Mastercard'
        this.slides.slideNext()
      } else {
        this.brand = 'ERROR'
      }
    }

    async slideNext() {
      let slideIndex = await this.slides.getActiveIndex()
      switch (slideIndex) {
        case 0:
          this.validateCard()    
          break;
        case 1:
          if (this.paymentCardForm.controls.fullName.valid) this.slides.slideNext()
        default:
          break;
      }
   
         
    }

    CVVFocus() {
      this.renderer.addClass(this.rotateCard.nativeElement, 'rotate-card');
    }
    
    CVVFocusOut() {
      this.renderer.removeClass(this.rotateCard.nativeElement, 'rotate-card');
    }
}
