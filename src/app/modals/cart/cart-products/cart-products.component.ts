import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CartService } from '../../../services/cart.service';
import { Utils } from '../../../../utils/util';
import { ActivatedRoute } from '@angular/router';
import { ModalsService } from 'src/app/services/modals.service';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-cart-products',
  templateUrl: './cart-products.component.html',
  styleUrls: ['./cart-products.component.scss'],
})
export class CartProductsComponent implements OnInit, OnDestroy {
  @Input() item;
  @Input() cartStatus;
  @Input() cartContext;
  @Input() product;
  @Input() loadingButton;
  @Input() disabled = false;

  cart;
  orderToken;
  cartSubscription;
  loadingIds = [];
  imageUrl = '../../../../assets/images/product_1.png';
  public host = environment.host;
  changingQuantity = false;

  @Output() noStockEvent = new EventEmitter<boolean>();

  constructor(private cartService: CartService,
              private modalService: ModalsService,
              private route: ActivatedRoute,
              private productService: ProductsService
            ) {
    this.orderToken = this.route.snapshot.queryParams.order_token;
    this.cartSubscription = this.cartService.getActiveCart$().subscribe(cart => {
      this.noStockEvent.emit(this.noStock)
      this.cart = cart;
    });
  }

  get noStock(){
    return !this.item?.attributes.sufficient_stock;
  }

  async openProduct(){
    const product = await this.productService.getProductById(this.product.id)
    this.modalService.openProduct(product)
    return
  }

  ngOnInit() {
    this.getItemImg();
  }

  ngOnDestroy() {
    this.cartSubscription.unsubscribe();
  }

  async addItem(item, event) {
    this.changingQuantity = true;
    Utils.addItemToArray(this.loadingIds, item.id);
    try {
      await this.cartService.addItem(item.relationships.variant.data, 1, item.attributes.options_text);
      this.changingQuantity = false
    } catch (error) {
      this.cartService.loadingCart$.next(false)
      this.loadingButton = false
      this.changingQuantity = false
    }

  }
  async removeItem(item) {
    this.changingQuantity = true;
    Utils.addItemToArray(this.loadingIds, item.id);
    await this.cartService.addItem(item.relationships.variant.data, -1, item.attributes.options_text);
    this.changingQuantity = false

  }

  getItemImg() {
    const cart = this.cartStatus ? this.cartStatus : this.cart;
    const variantId = this.item.relationships.variant.data.id;
    const images = Utils.getIncluded(cart, 'image');
    const variant = cart.included.find(v => v.type === 'variant' && v.id === variantId);
    if (variant) {
      const product = cart.included.find(p => p.type === 'product' && p.id === variant.relationships.product.data.id);
      if (product.relationships.images.data.length) {
        const imageId = product.relationships.images.data[0].id;
        this.imageUrl = images.find(img => img.id === imageId).attributes.cdn_url;
      }
    }
  }

  async deleteItem(item) {
    this.changingQuantity = true;
    Utils.addItemToArray(this.loadingIds, item.id);
    await this.cartService.removeItem(item.relationships.variant.data, -1, item.attributes.options_text, true);
    this.changingQuantity = false
  }

  isLoad(id) {
    return this.loadingIds.includes(+id);
  }
}
