import { Component, ElementRef, Input, OnInit, Output, Renderer2, ViewChild, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { KushkiService } from 'src/app/services/kushki.service';
import { ModalsService } from 'src/app/services/modals.service';
import { SecurityProvider } from 'src/app/services/security.service';


@Component({
  selector: 'app-payment-methods-card',
  templateUrl: './payment-methods-card.component.html',
  styleUrls: ['./payment-methods-card.component.scss'],
})
export class PaymentMethodsCardComponent implements OnInit {

  @ViewChild(IonItemSliding) ionSliding: IonItemSliding;
  @ViewChild('openSlide', { static: false }) openSlide: ElementRef
  @Input() events: Observable<any>;
  @Input() card;
  @Input() color;
  @Output() sendDeleteCard = new EventEmitter<boolean>();
  @Output() sendDefaultCard = new EventEmitter<boolean>();
  buttonName;
  loadinng = true
  
  
  private eventsSubscription: Subscription
  constructor(
    private renderer: Renderer2,
    private security: SecurityProvider,
    private kushkiService: KushkiService,
    private modalService: ModalsService
  ) { 
    
  }

  ngOnInit() {
    this.eventsSubscription = this.events.subscribe(
      resp => {
        this.buttonName = resp
      })
  }

  deleteCard(card) {
    this.sendDeleteCard.emit(card)
  }

  get buttonNameValue() {
    return this.buttonName
  }

  defaultCard(card) {
    this.sendDefaultCard.emit(card)
  //   window.analytics.track('defaultCard', {
  //     'user': this.security.getUserData().data.attributes.email,
  //     'data_card': [
  //       {
  //         'type': card.brand,
  //         'last_digits': card.lastDigits
  //       }
  //     ]
  //   })
  }

}
