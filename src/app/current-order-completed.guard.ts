import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CartService } from './services/cart.service';

@Injectable({
  providedIn: 'root'
})
export class CurrentOrderCompletedGuard implements CanActivateChild {

  constructor(private router: Router, private cartService: CartService) {

  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (route.routeConfig.path == '' || route.routeConfig.path == 'tabs' || route.routeConfig.path == 'home') {
      return true
    } else {
      return new Promise((resolve) => {
        let res = this.cartService.checkIfNotCompletedOrder()
        res.then(async (notCompletedOrder) => {
          let currentCart = await this.cartService.activeCart$.getValue();
          if (!notCompletedOrder && currentCart) {
            this.router.navigate(['/orders', currentCart.data.attributes.number], {
              replaceUrl: true,
              queryParams: {
                order_token: currentCart?.data.attributes.token
              }
            })
          }
          resolve(res);
        }).catch(err => {
          resolve(true);
        });
      })
    }
  }
}
