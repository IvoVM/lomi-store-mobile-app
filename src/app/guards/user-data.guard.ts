import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SecurityProvider } from '../services/security.service';

@Injectable({
  providedIn: 'root'
})
export class UserDataGuard implements CanActivate {

  constructor(
    private securityProvider: SecurityProvider,
    private router: Router
  ) {

  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.securityProvider.isLoggedIn().value) {
      console.log(this.securityProvider.getUserData().data.attributes)
      let { first_name, last_name } = this.securityProvider.getUserData().data.attributes
      if (!first_name && !last_name) {
        this.router.navigate(['/about-you'])
        return false
      }
    }
    return true;
  }

}
