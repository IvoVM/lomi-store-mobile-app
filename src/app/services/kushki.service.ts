import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Kushki } from '@kushki/js'
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KushkiService {

  paymentMethodPage$: BehaviorSubject<string> = new BehaviorSubject<string>('')
  optionSelected$: BehaviorSubject<any> = new BehaviorSubject<any>([])
  kushki;

  constructor(
    private http: HttpClient
  ) { 
  }

  initKushki() {
     this.kushki = new Kushki({
      merchantId: environment.KUSHKI_PUBLIC_MERCHANT_ID
      // inTestEnvironment: true,
    });
    return this.kushki
  }

  getCards() {
    return this.http.get(environment.host + 'api/v2/storefront/account/credit_cards')
      .pipe(
        map(resp => resp['data'])      
      )
  }

  registerCreditCard(card) {
    return this.http.post(environment.host + 'api/v2/storefront/account/credit_cards', {
      card
    })
  }

  registerDebitoCard(kushki_token) {
    return this.http.post(environment.host + 'api/v2/storefront/account/credit_cards/async_cards', {
      async: true,
      card: {
        cc_type: 'debit',
        kushki_token: kushki_token
      }
    })
  }

  deleteCard(id) {
    console.log(id)
    return this.http.delete(environment.host + `api/v2/storefront/account/credit_cards/${id}`)
  }

  setDefaultCard(id) {
    return this.http.patch(environment.host + `api/v2/storefront/account/credit_cards/${id}/set_default`, {})
  }

  getTransactionStatus(token) {
    return this.http.get(environment.host + `api/v2/storefront/checkout/transaction_status/${token}`)
  }

}
