import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { AnimationOptions } from '@ionic/angular/providers/nav-controller';
import { Router } from '@angular/router';
import { ModalAccountComponent } from '../../../modals/account/modal-account.component';
import { SecurityProvider } from '../../../services/security.service';
import { ProductsService } from '../../../services/products.service';
import { CartService } from 'src/app/services/cart.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Component({
  selector: 'app-btn-back-navigation',
  templateUrl: './btn-back-navigation.component.html',
  styleUrls: ['./btn-back-navigation.component.scss'],
})
export class BtnBackNavigationComponent implements OnInit {
  product;
  taxon;
  productId;
  
  @Output() onBack = new EventEmitter<boolean>();

  constructor(public navCtrl: NavController,
              public router: Router,
              public userEvents:UserEventsService,
              public securityProvider: SecurityProvider,
              public cartService: CartService,
              public productService: ProductsService,
              private modalCtrl: ModalController) {
  }

  ngOnInit() {
    this.productService.activeModalProduct$.subscribe(product => {
      this.product = product;
    });
    this.productService.activeModalTaxon$.subscribe(taxon => {
      this.taxon = taxon;
    });
    this.router.events.subscribe(()=>{
      this.router.url.includes('/')
    })
  }

  goBackLocation() {
    this.userEvents.userEvents['back_button.clicked'].track()
    const url = this.router.url.split("/");
    if(url[url.length-1] == 'orders'){
      this.router.navigate(['/home']).then();
    }
    else if (this.router.url.includes('orders')) {
     this.router.navigate(['/tabs/orders']).then();
      return
    }

    this.onBack.emit(true);
    if(this.router.url.includes('home')){
      this.openModalAccount().then()
    } else if(false && this.router.url.includes('products')){
      this.navCtrl.navigateRoot('/tabs/products')
    } else if(this.router.url.includes('/orders')) {
      this.navCtrl.navigateBack('/tabs/home')
    } else if (this.router.url.includes('checkout-kushki')) {
      this.navCtrl.navigateBack('/cart')
    } else if (this.router.url.includes('cart')) {
      this.navCtrl.navigateBack('/tabs/home')
    } else {
      this.productService.activeModalTaxon$.next(null);
      this.navCtrl.back();
    }

    return
    if (this.router.url === '/producers') {
      this.router.navigate(['home']).then();
    } else if (this.router.url === '/search') {
      this.router.navigate(['home']).then();
    } else if (this.taxon === 'search') {
      this.router.navigate(['search']).then();
    } else if (this.router.url.includes('/producers/')) {
      this.router.navigate(['producers']).then();
    } else if (this.productId && this.taxon && this.router.url.includes('/product/') && +this.router.url.split('/').splice(-1)[0] == +this.productId) {
      this.productId = null
      const route = this.taxon.profile_image ? 'producers' : 'taxon';
      this.router.navigate([route, this.taxon.id]).then();
    } else if (this.product) {
      this.productId = this.product.id;
      this.router.navigate(['product', this.product.id]).then();
      this.productService.activeModalProduct$.next(null);
    } else if (this.router.url.includes('home') && !this.router.url.includes('home-')) {
      if (this.securityProvider.isLoggedIn().getValue()) {
        this.openModalAccount().then()
      } else {
        this.router.navigate(['/login']).then();
      }
    } else if (this.router.url.includes('login') || this.router.url.includes('registration')) {
      this.router.navigate(['/home']).then();
    } else if (this.router.url.includes('tabs')) {
      this.router.navigate(['/home']).then();
    } else if (this.router.url.includes('/taxon') && (this.taxon && this.taxon.attributes.depth <= 1)) {
      if(!this.taxon.relationships.parent){
        this.navCtrl.back();
      } else {
        this.taxon.relationships.parent.data.id != '1695' ? 
          this.router.navigate(['tabs', 'featured']).then() : 
          this.navCtrl.back();
      }
    } else {
      if (this.taxon && (!this.taxon.attributes || this.taxon.attributes.depth <= 1)) {
        const route = this.taxon.profile_image ? 'producers' : 'taxon';
        this.router.navigate([route, this.taxon.id]).then();
      } else {
        this.navCtrl.back();
      }
    }
  }



  async openModalAccount() {
    const modal = await this.modalCtrl.create({
      component: ModalAccountComponent,
      canDismiss: true,
      cssClass: 'modal-class'
    });

    await modal.present();
  }
}
