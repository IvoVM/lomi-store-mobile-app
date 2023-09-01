import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ModalsService } from 'src/app/services/modals.service';
import { ProductsService } from 'src/app/services/products.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit {

  showSkeleton: boolean
  existProducts: boolean 
  filterBy = [
    {name: 'Sin Zúcar', icon: '../../../../assets/images/no_sugar.svg', id: 164, products: []}, 
    {name: 'Sin Gluten', icon: '../../../../assets/images/no_glute.svg', id: 166, products: []},
    {name: 'Vegano', icon: '../../../../assets/images/veggie.svg', id: 165, products: []},
    {name: 'Orgánico', icon: '../../../../assets/images/organic.svg', id: 167, products: []}, 
  ]

  constructor(
    private productService: ProductsService,
    private router: Router,
    private modalsService: ModalsService,
    private userEventsService: UserEventsService,
    private iab:InAppBrowser
    ) { }

  ngOnInit(): void {
    this.userEventsService.userEvents['discover_screen.loaded'].track()
  }
  
  async ionViewDidEnter() {
    this.showSkeleton = true
    this.existProducts = false
    this.getProducts()
    this.showSkeleton = false
  }
  
  getProducts(): void {
    this.filterBy.forEach(async (element, index) => {
      const p = await this.productService.getProductsByTaxon(element.id, 12)
      this.filterBy[index].products = p.data
      if (this.filterBy[index].products.length > 0) this.existProducts = true
    });
  }

  searchAllPreferences(filterBy) {
    this.router.navigate([`taxon/${filterBy.id}`], {
      queryParams : {
        taxonName : filterBy.name
      }
    }).then();
  }

  goToChild(childPage: string):void  {
    this.userEventsService.userEvents['goToChild.clicked'].track()
    this.router.navigate([`tabs/discover/${childPage}`])
  }

  async openProduct(product) {
    this.modalsService.openProduct(product);
  }

  goToReferred() {
    this.iab.create('https://lomi.cl/referidos', '_blank')
  }
}
