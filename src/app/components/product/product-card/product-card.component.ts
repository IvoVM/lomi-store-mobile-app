import { Component, Input, OnInit } from '@angular/core';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { ProductRemovedEventParams } from 'src/app/user-events/user-events.types';
import { environment } from '../../../../environments/environment';
import { Utils } from '../../../../utils/util';
import { CartService } from '../../../services/cart.service';
import { LaunchDarklyService } from '../../../services/launch-darkly.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent implements OnInit {
  @Input() product;
  discountPresent = false;
  master;
  price;
  comparePrice;
  activeVariant;
  optionValues = [];
  cart;
  loadingCart = true;
  quantityInCart = 0;
  addingItem = false;

  //Feature flags
  removingItem = false;
  addButtonFlag = false;
  hideLoading = false;
  hideAllLoading = false;

  public host = environment.host;
  constructor(private cartService: CartService,
              private userEventsService: UserEventsService,
              private ldService: LaunchDarklyService) {
    this.cartService.getLoadingCart$().subscribe(loading => {
      this.loadingCart = loading;
    });
    
  }

  async ngOnInit() {
    //console.log(JSON.stringify(this.product, null, 2));
    if(!this.product){
      return
    }
    await this.setProductAttr();
    this.cartService.getActiveCart$().subscribe(cart => {
      if (cart) {
        this.getCartQuantity(cart);
        this.cart = cart;
      }
    });
    this.addButtonFlag = await this.ldService.client.variation("product-add-button", false);
    this.hideAllLoading = await this.ldService.client.variation("product-add-button-hide-all-loading-related", false);
    this.hideLoading = await this.ldService.client.variation("product-add-button-hide-loading-animation", false);

  }

  reducedSize(img){
    return img.replace("https://cdn2.lomi.cl/","https://cdn2.lomi.cl/cdn-cgi/image/width=600,height=600,f=auto,fit=pad/")
  }

  getProductImg(product) {
    if (product) {
      try{
        const variant = product.variants.find(variant => {
          if(!variant){
            return false;
          }
          return variant?.attributes.in_stock && variant?.attributes.purchasable
        });
        this.master = variant ? variant : product;
        this.isDctoPresent();
        return Utils.getImgBySize(product);

      } catch (e){
        console.log("error",e.stack)
      }
    }
  }

  animateOnTouch(cardElement:any){
    this.userEventsService.userEvents['product.clicked'].track()
    console.log(cardElement.el.classList.add("animate"))
    setTimeout(()=>{
      cardElement.el.classList.remove("animate")
    }, 800)
  }

  getPrice() {
    return this.master.attributes.display_price
  }

  getDiscountPercentage() {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }

  isDctoPresent() {
    if(!this.product || !this.activeVariant){
      return false
    }
    const comparePrice = parseFloat(this.activeVariant.attributes.compare_at_price);
    const price = parseFloat(this.activeVariant.attributes.price);
    if (comparePrice > 0 && comparePrice > price) {
      this.price = price;
      this.comparePrice = comparePrice;
      this.discountPresent = true;
    }
  }

  getCartQuantity(cart) {
    if (cart) {
      let lineItems = Utils.getIncluded(cart, 'line_item');
      if (!lineItems.length) {
        this.quantityInCart = 0;
        return
      }
      let currentItem = null;
      if(this.activeVariant) {
        currentItem = lineItems.find(item => item.relationships.variant.data.id === this.activeVariant.id)
      }
      
      this.quantityInCart = currentItem ? currentItem.attributes.quantity : 0;
    }
  }

  async setProductAttr() {
    if(this.product) {
      this.setOptionValues(this.product.variants);
      const p = this.product
      this.setActiveVariant(p.variants.find(v => (v.attributes.in_stock || v.attributes.backorderable)).id);
    }    
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

  setActiveVariant(variantId) {
    const ids = [];
    this.product.images.filter(i => +i.attributes.viewable_id == this.product.id).forEach(img => {
      ids.push(img.id);
    });
    this.activeVariant = this.product.variants.find(v => +v.id === +variantId);
    this.product.attributes = { ...this.product.attributes, ...this.activeVariant.attributes };
    this.activeVariant.relationships.images.data.forEach(img => ids.push(img.id));
    this.isDctoPresent();
    this.getCartQuantity(this.cart);
  }

  async addItem(event: Event) {
    if(this.addingItem && this.hideLoading){
      return
    }
    event.stopPropagation();
    const productAddedEvent = {
      "currency": this.product.attributes.currency,
      "item": {
        "id" : this.product.id,
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
    this.userEventsService.userEvents['product.added'].track(productAddedEvent)
    this.addingItem = true;
    await this.cartService.addItem(this.activeVariant, 1, this.activeVariant.attributes.options_text);
    this.addingItem = false;
  }

  async removeItem(event: Event, quantityInCart) {
    if(this.removingItem && this.hideLoading){
      return
    }
    event.stopPropagation();
    const productRemovedEventParams: ProductRemovedEventParams = {
      "currency": this.product.attributes.currency,
      "item": {
        "id" : this.product.id,
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
    this.userEventsService.userEvents['product.removed'].track(productRemovedEventParams);
    this.removingItem = true;
    if (quantityInCart === 1 ) {
      await this.cartService.removeItem(this.activeVariant, quantityInCart*-1, this.activeVariant.attributes.options_text);
    } else {
      await this.cartService.addItem(this.activeVariant, -1, this.activeVariant.attributes.options_text);
    }
    this.removingItem = false;
  }
}
