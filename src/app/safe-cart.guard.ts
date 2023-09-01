import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { CartService } from './services/cart.service';
import { CheckoutService } from './services/checkout.service';

@Injectable({
  providedIn: 'root'
})
export class SafeCartGuard implements CanActivate {
  constructor(
    private checkoutService:CheckoutService,
    private navCtrl:NavController,
    private cartService:CartService
    ){}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.checkoutService.restartCartState().then((cartRestarted)=>{
      if(!cartRestarted){
        this.navCtrl.pop();
        this.cartService.showToast("Hubo un error. Verifique su conexión a internet")
      }
    })
     return true;
  }
  
}
