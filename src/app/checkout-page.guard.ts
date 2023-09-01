import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CartService } from './services/cart.service';
import { CheckoutService } from './services/checkout.service';
import { ModalsService } from './services/modals.service';

@Injectable({
  providedIn: 'root'
})
export class CheckoutPageGuard implements CanActivate {

  constructor(
    public checkoutService:CheckoutService, 
    public cartService:CartService,
    public modalsService: ModalsService,
    public router:Router
    ){
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let invalidCart =  this.cartService.activeCart$.getValue().data.attributes.state != 'payment'
    if(invalidCart){
      setTimeout(async ()=>{
        this.router.navigateByUrl('/cart')
        this.cartService.showToast("Lo sentimos, hubo un error al proceder al pago")
      }, 0)
    }
    return !invalidCart;
  }
  
}
