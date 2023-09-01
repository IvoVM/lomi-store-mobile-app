import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding, NavController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { CartService } from 'src/app/services/cart.service';
import { KushkiService } from 'src/app/services/kushki.service';
import { ModalsService } from 'src/app/services/modals.service';
import { SecurityProvider } from 'src/app/services/security.service';

@Component({
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.page.html',
  styleUrls: ['./payment-methods.page.scss'],
})
export class PaymentMethodsPage implements OnInit {

  @ViewChild(IonItemSliding) ionSliding: IonItemSliding;
  sendButtonName: Subject<any> = new Subject<any>();
  buttonName = 'Administrar';
  editable = false;
  cards = [];
  favorite = []
  loader = false;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private kushkiService: KushkiService,
    private modalService: ModalsService,
    private cartService: CartService
  ) { 
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getCards()
  }

  getCardsChild(event) {
    console.log(event)
    // this.getCards()
  }

  goBack(): void {
    this.navCtrl.navigateBack('/tabs/menu');
  }

  createCard() {
    this.kushkiService.paymentMethodPage$.next('payment-methods')
    this.router.navigateByUrl('/create-payment-card').then()
  }

  editPaymentMethod(): boolean {
    if (!this.editable) {
      this.buttonName = 'Listo';
      this.sendButtonName.next(this.buttonName);
    } else {
      this.buttonName = 'Administrar';
      this.sendButtonName.next(this.buttonName);
    }
    return this.editable = !this.editable;
  }

  getCards() {
    this.favorite = []
    this.cards = []
    this.kushkiService.getCards().subscribe(resp => {
      console.log('## resp', resp)
      resp.forEach(element => {
        if (element.attributes.default && element.attributes.provider) {
          this.favorite.push(element)
        } else if (element.attributes.provider) {
          this.cards.push(element)
        }
      });
    })
  }

  deleteCard(card) {
    this.loader = true
    console.log(card)
    this.kushkiService.deleteCard(card.id).subscribe(
      resp => {
        this.loader = false;
        this.getCards();
        this.buttonName = 'Administrar';
        this.sendButtonName.next(this.buttonName);
      })
  }

  setDefaultCard(card) {
    this.modalService.openSetDefaultCard().then(modal => {
      modal.onWillDismiss().then(res => {
        if (res.data) {
          this.kushkiService.setDefaultCard(card.id).subscribe(
            resp => {
              this.getCards();
              this.buttonName = 'Administrar';
              this.sendButtonName.next(this.buttonName);
            }, 
            err => 
            this.cartService.showToast(err)
          )}
      })
    })
  }


}
