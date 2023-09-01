import { Component, Input, OnInit } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';
import { ModalsService } from 'src/app/services/modals.service';
import { ProductsService } from 'src/app/services/products.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { Utils } from 'src/utils/util';

@Component({
  selector: 'app-lomibox-card',
  templateUrl: './lomibox-card.component.html',
  styleUrls: ['./lomibox-card.component.scss'],
})
export class LomiboxCardComponent implements OnInit {

  @Input() box
  products = []
  boxPrice = 0
  activeVariant
  cart

  constructor(
    private modalService: ModalsService,
    private productService: ProductsService,
    private cartService: CartService,
    private userEventsService: UserEventsService,
  ) { }
  
  ngOnInit() { 
    this.getProducts()
  }

  openBoxModal() {
    this.userEventsService.userEvents['openBoxModal.clicked'].track({
      mix: this.box
    })
    this.modalService.openLomiBoxModal({box: this.box, products: this.products, boxPrice: this.boxPrice})
  }

  async getProducts(): Promise<any> {
    this.box.products.forEach(async (element) => {
      let p = await this.productService.getProductById(element.id)
      const variant = p.variants.find(variant => {
        if(!variant){
          return false;
        }
        if(variant?.attributes.in_stock && variant?.attributes.purchasable) {
          this.boxPrice += +variant.attributes.price
          this.products.push(p)
        }
      });
    })
  }

  async addAllProducts() {
    this.userEventsService.userEvents['openBoxModal.added'].track({
      mix: this.box
    })
    this.modalService.dismissTopModal()
    this.modalService.openProcesingData({ title: 'Estamos agregando los productos al carrito...' })
    let count = 0;
    this.products.forEach(async (element) => {
      await this.cartService.addItem(element.variants[0], 1, element.variants[0].attributes.options_text, true)
      count ++
      if (this.products.length == count) {
        this.modalService.dismissTopModal()
        this.modalService.openStockRepeatOrder()
        this.modalService.dismissTopModal()
      }
    })
  }
}
