import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService } from '../../../services/products.service';
import { CartService } from '../../../services/cart.service';
import { BehaviorSubject } from 'rxjs';
import { ProducersService } from '../../../services/producers.service';
import { Utils } from '../../../../utils/util';
import { Platform  } from '@ionic/angular';
import { ProductAddedEventParams, ProductRemovedEventParams, ProductViewedEventParams } from 'src/app/user-events/user-events.types';
import { UserEventsService } from 'src/app/user-events/user-events.service';


@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})

export class ProductDetailComponent implements OnInit {
  @Input() id;
  @Input() onModal;
  @Input() producer;
  @Input() product;
  products;
  activeVariant;
  optionValues = [];
  imagesIds: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  loadingCart = true;
  discountPresent = false;
  price;
  comparePrice;
  quantityInCart = 0;
  cart;
  count = 0;

  constructor(public router: Router,
              public platform:Platform,
              public productsService: ProductsService,
              public producersService: ProducersService,
              public userEventService: UserEventsService,
              private cartService: CartService,
            ) {
    this.productsService.getActiveFeaturedProducts$().subscribe(products => {
      this.products = products;
    });

    this.cartService.getLoadingCart$().subscribe(loading => {
      if (this.count == 0) {
        this.loadingCart = false
      } else {
        this.loadingCart = loading;
      }
      this.count ++;
    });

  }

  async ngOnInit() {
    console.log(this.producer)
    if (this.id && !this.product) {
      this.product = this.productsService.productList[this.id];
    }
    if(!this.product){
      this.router.navigateByUrl('tabs/home')
    }
    if(this.product){
      this.producer = await this.producersService.getProducer(this.product.attributes.producer_id).toPromise();
      console.log(this.producer)
      await this.setProductAttr();
      const productViewedEventParams:ProductViewedEventParams = {
        "currency": this.product.attributes.currency,
        "item": {
          "id" : this.id,
          //"attributes" : JSON.stringify(this.product.attributes, null, 2),
          "name": this.product.attributes.name,
          "description": this.product.attributes.description.trim(),
          "producer_id": this.product.attributes.producer_id,
          "currency": this.product.attributes.currency,
          "price": this.product.attributes.price,
          "display_price": this.product.attributes.display_price,
          "compare_at_price": this.product.attributes.compare_at_price,
          "display_compare_at_price": this.product.attributes.display_compare_at_price,
          "sku": this.product.attributes.sku,
          "weight": this.product.attributes.weight,
          "height": this.product.attributes.height,
          "width": this.product.attributes.width,
          "depth": this.product.attributes.depth,
          "is_master": this.product.attributes.is_master,
          "options_text": this.product.attributes.options_text,
          "purchasable": this.product.attributes.purchasable,
          "in_stock": this.product.attributes.in_stock,
          "backorderable": this.product.attributes.backorderable,
          "quantity": 1
        },
        "value": this.product.attributes.price
      }
      this.userEventService.userEvents['product.viewed'].track(productViewedEventParams)
      this.cartService.getActiveCart$().subscribe(cart => {
        if (cart) {
          this.getCartQuantity(cart);
          this.cart = cart;
        }
      });
    }
  }



  async setProductAttr() {
    this.setOptionValues(this.product.variants);
    const p = this.product
    this.setActiveVariant(p.variants.find(v => (v.attributes.in_stock || v.attributes.backorderable)).id);
    console.log(this.producer,"mm")
  }

  setOptionValues(variants) {
    variants.forEach(v => {
      if ((v.attributes.in_stock || v.attributes.backorderable) && v.attributes.purchasable) {
        const option = {
          type: v.attributes.options_text.split(': ')[0],
          name: v.attributes.options_text.split(': ')[1],
          variantId: v.id
        }
        if(v.attributes.in_stock || v.attributes.backorderable){
          this.optionValues.push(option);
        }
      }
    });
  }

  selectActiveVariant(variantId) {
    this.setActiveVariant(variantId);
    this.userEventService.userEvents['product_variant.clicked'].track({
      variantId: variantId
    })
  }

  setActiveVariant(variantId) {
    const ids = [];
    this.product.images.filter(i => +i.attributes.viewable_id == this.product.id).forEach(img => {
      ids.push(img.id);
    });
    this.activeVariant = this.product.variants.find(v => +v.id === +variantId);
    this.product.attributes = { ...this.product.attributes, ...this.activeVariant.attributes };
    this.activeVariant.relationships.images.data.forEach(img => ids.push(img.id));
    this.imagesIds.next(ids);
    this.isDctoPresent();
    this.getCartQuantity(this.cart);
  }

  isDctoPresent() {
    const comparePrice = parseFloat(this.activeVariant.attributes.compare_at_price);
    const price = parseFloat(this.activeVariant.attributes.price);
    if (comparePrice > 0 && comparePrice > price) {
      this.price = price;
      this.comparePrice = comparePrice;
      this.discountPresent = true;
    }
  }

  getDiscountPercentage() {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }

  async addItem() {
    const productAddedEventParams:ProductAddedEventParams = {
      "currency": this.product.attributes.currency,
      "item": {
        "id" : this.id,
        //"attributes" : JSON.stringify(this.product.attributes, null, 2),
        "name": this.product.attributes.name,
        "description": this.product.attributes.description.trim(),
        "producer_id": this.product.attributes.producer_id,
        "currency": this.product.attributes.currency,
        "price": this.product.attributes.price,
        "display_price": this.product.attributes.display_price,
        "compare_at_price": this.product.attributes.compare_at_price,
        "display_compare_at_price": this.product.attributes.display_compare_at_price,
        "sku": this.product.attributes.sku,
        "weight": this.product.attributes.weight,
        "height": this.product.attributes.height,
        "width": this.product.attributes.width,
        "depth": this.product.attributes.depth,
        "is_master": this.product.attributes.is_master,
        "options_text": this.product.attributes.options_text,
        "purchasable": this.product.attributes.purchasable,
        "in_stock": this.product.attributes.in_stock,
        "backorderable": this.product.attributes.backorderable,
        "quantity": 1
      },
      "value": this.product.attributes.price
    } 
    this.userEventService.userEvents['product.added'].track(productAddedEventParams)
    await this.cartService.addItem(this.activeVariant, 1, this.activeVariant.attributes.options_text);
  }

  async removeItem() {
    const productRemovedEventParams: ProductRemovedEventParams = {
      "currency": this.product.attributes.currency,
      "item": {
        "id" : this.id,
        //"attributes" : JSON.stringify(this.product.attributes, null, 2),
        "name": this.product.attributes.name,
        "description": this.product.attributes.description.trim(),
        "producer_id": this.product.attributes.producer_id,
        "currency": this.product.attributes.currency,
        "price": this.product.attributes.price,
        "display_price": this.product.attributes.display_price,
        "compare_at_price": this.product.attributes.compare_at_price,
        "display_compare_at_price": this.product.attributes.display_compare_at_price,
        "sku": this.product.attributes.sku,
        "weight": this.product.attributes.weight,
        "height": this.product.attributes.height,
        "width": this.product.attributes.width,
        "depth": this.product.attributes.depth,
        "is_master": this.product.attributes.is_master,
        "options_text": this.product.attributes.options_text,
        "purchasable": this.product.attributes.purchasable,
        "in_stock": this.product.attributes.in_stock,
        "backorderable": this.product.attributes.backorderable,
        "quantity": 1
      },
      "value": this.product.attributes.price
    }
    this.userEventService.userEvents['product.removed'].track(productRemovedEventParams)
    await this.cartService.addItem(this.activeVariant, -1, this.activeVariant.attributes.options_text);
  }

  getCartQuantity(cart) {
    if (cart) {
      let lineItems = Utils.getIncluded(cart, 'line_item');
      if (!lineItems.length) {
        this.quantityInCart = 0;
        return
      }
      const currentItem = lineItems.find(item => item.relationships.variant.data.id === this.activeVariant.id)
      this.quantityInCart = currentItem ? currentItem.attributes.quantity : 0;
    }
  }
}
