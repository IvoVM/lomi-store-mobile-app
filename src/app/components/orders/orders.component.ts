import { Component, Input, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { SecurityProvider } from '../../services/security.service';
import { Router } from '@angular/router';
import { Utils } from '../../../utils/util';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { ModalsService } from 'src/app/services/modals.service';
import { CartService } from 'src/app/services/cart.service';
import { ToastController } from '@ionic/angular';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit {
  @Input() reachBottom;
  orders;
  logged;
  links = {
     next: 0,
     self: 0,
     total: 0,
  };
  loading = false;
  error = false;
  cartItems = [];
  variants = [];
  noStockProduct = []

  constructor(private orderService: OrderService,
              private router: Router,
              private userEventsService: UserEventsService,
              private securityProvider: SecurityProvider,
              private toastCtrl: ToastController,
              private cartService: CartService,
              private productService: ProductsService,
              private modalService: ModalsService) {

    this.securityProvider.isLoggedIn().subscribe(logged => {
      this.logged = logged;
      if (logged && !this.loading) {
        this.loading = true;
        setTimeout(() => this.getOrders(), 0);
      }
    });
  }

  ngOnInit() {
    this.noStockProduct = []
    this.reachBottom.subscribe(resp => {
      if (!this.loading && this.logged) {
        if(this.links.next != this.links.self){
          this.getOrders(this.links.next);
          this.loading = true;
        } else {
          this.loading = false
        }
      }
    });
  }

  getDate(date) {
    return new Date(date);
  }



  getOrders(page = 1, perPage = 3) {
    if(!this.orders) this.orders = [];
    this.orderService.orders({
      page,
      perPage
    }).then(resp => {
        if (resp) {
          this.orders.push(...resp.data);
          this.links = {
            next: +Utils.getUrlParam(resp.links.next, 'page'),
            self: +Utils.getUrlParam(resp.links.self, 'page'),
            total: +resp.meta.total_pages,
          }
          this.getImages()
        } else {
          this.securityProvider.checkStoredSession();
          this.error = true;
        }
        this.loading = false;
      }
    ,
    );
  }

  showOrder(order) {
    this.userEventsService.userEvents['order_details.clicked'].track({
      number: order.attributes.number
    })
    const number = order.attributes.number;
    const token = order.attributes.token;
    this.router.navigate(['/orders', number], { queryParams: { order_token: token } }).then();
  }

  getOrderState(state) {
    switch (state) {
      case 'complete':
        return 'Completado'
      default:
        return state
    }
  }

  getPaymentState(state) {
    switch (state) {
      case 'paid':
        return 'Pagado'
      default:
        return state
    }
  }

  getShipmentState(state) {
    switch (state) {
      case 'shipped':
        return 'Enviado'
      case 'ready':
        return 'Listo'
      default:
        return state
    }
  }

  async openProduct(order, index) {
    let p = await this.productService.getProductById(order.products_id[index].id)
    this.modalService.openProduct(p)
  }
  
  async getImages() {
    for (let x = 0; x < this.orders.length; x++) {
      let cart =  await this.orderService.order(this.orders[x].attributes.token, this.orders[x].attributes.number)
      if (cart.isFail()) break
      let images = []
      let products = []
      cart.success().included.forEach((element) => {
        if (element.type == 'product') {
          products.push(element)
          this.orders[x]['products_id'] = products
        }
        if (element.type == 'image') {
          images.push(element.attributes.cdn_url)
          this.orders[x]['product_cdn_url'] = images
        }
      })
    }
  }

  async getLineItems(order) {
    let cart = await this.orderService.order(order.attributes.token, order.attributes.number)
    if (cart.isFail()) return
    this.cartItems = Utils.getIncluded(cart.success(), 'line_item');
    let cartIncluded = cart.success().included
    cartIncluded.forEach(element => {
      if(element.type == 'variant') {
        this.variants.push(element)
      }
    });
  }

  async repeatOrder(order) {
    this.userEventsService.userEvents['repeat_order.done'].track({
      cartNumber: order.attributes.number
    })
    await this.getLineItems(order)
    try {
      let timeOut = 30;
      let count = 0;
      this.modalService.openProcesingData({title: 'Estamos agregando los productos al carrito...', subTitle: 'Esto puede tomar unos segundos'})
      let interval = setInterval(() => {
        count ++
        if (count >= timeOut) {
          this.modalService.dismissTopModal()
          clearInterval(interval)
          this.router.navigate(['/cart']).then(() => {
            this.modalService.openStockRepeatOrder()
          })
        }
      }, 1000);
      for (let x = 0; x < this.variants.length; x++) {
        let quantity;
        let product = this.cartItems.filter(c => c['relationships'].variant.data.id === this.variants[x].id)
        quantity = product[0].attributes.quantity
        for (let i = 0; i < quantity; i ++) {
          let response = await this.cartService.addItem(this.variants[x], 1, this.variants[x].attributes.options_text, true)
          if(JSON.stringify(response).includes('error')) {
            this.noStockProduct.push(product[0].attributes.name)
            break
          };
        }
        if(this.variants.length -1 == x ) {
          this.modalService.dismissTopModal()
          clearInterval(interval)
          this.router.navigate(['/cart']).then(() => {
            this.modalService.openStockRepeatOrder()
          })
        }
      };
    } catch (error) {
      this.showToast(error)
    }
  }
  async showToast(message, color = 'danger') {
    await this.toastCtrl.create({
      message: message,
      duration: 5000,
      position: 'bottom',
      cssClass: 'toast-error',
      color: color,
      buttons: [{
        text: 'OK',
        handler: () => {
        }
      }]
    }).then(res => res.present());
  }
  
}
