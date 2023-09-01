import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { ModalCartComponent } from '../../modals/cart/modal-cart.component';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { AddressService } from '../../services/address.service';
import { ProductsService } from '../../services/products.service';
import { SearchService } from '../../services/search.service';
import { TaxonsServices } from 'src/app/services/taxons.services';
import { CheckoutService } from 'src/app/services/checkout.service';
import { IonSearchbar } from '@ionic/angular';
import { ModalsService } from 'src/app/services/modals.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Component({
  selector: 'app-main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent implements OnInit {
  public title: string;
  amount = 0;
  loadingCart = true;
  limpiarOpen = false;
  address;
  product;
  taxon;
  taxonBanner;
  searching = false;
  keyword = ""
  searchBarOpened: boolean = false;
  public taxonsChildren = [];
  public searchOpen = false;
  public activeHeader:boolean = true;
  public searchInsideService = false;

  isItemAvailable = false;
  items = [];
  @ViewChild('q') searchElement:IonSearchbar;

  constructor(private modalCtrl: ModalController,
    public router: Router,
    public searchService: SearchService,
    public navController: NavController,
    private userEventsService: UserEventsService,
    private http: HttpClient,
    private modalService: ModalsService,
    private nativeStorage: Storage,
    private taxonService: TaxonsServices,
    private productService: ProductsService,
    private addressService: AddressService,
    private taxonsService: TaxonsServices,
    private checkout: CheckoutService,
    private cartService: CartService,
    private route: ActivatedRoute,
    ) {
    this.addressService.activeAddress.subscribe((activeAddress: any) => {
      this.initializeItems(activeAddress).then(() => {
        this.address = activeAddress;
      });
    });

    this.cartService.getActiveCart$().subscribe(cart => {
      if (cart?.data) this.amount = cart.data.attributes.item_count
      this.loadingCart = false;
    });
    this.cartService.getLoadingCart$().subscribe(loading => {
      this.loadingCart = loading;
    });
    this.cartService.openCart$.subscribe(() => this.openCart())
  }
  

  ngOnInit() {
    this.userEventsService.userEvents['search_bar.loaded'].track()
    this.searchService.searchBarOpened$.subscribe((state)=>{
      this.searchBarOpened = state;
      this.searchOpen = state;
    })
    this.searchService.currentSearch$.subscribe((search)=>{
      this.keyword = search;
    })

    this.resolveTitle();
    this.productService.activeModalProduct$.subscribe(product => {
      this.product = product;
      
    });
    this.productService.activeModalTaxon$.subscribe(async taxon => {

      this.taxon = taxon;
      //this.title = taxon.attributes.name

      });
    this.router.events.subscribe((events) => {
      if(events instanceof NavigationEnd){
        this.title = this.route.snapshot.queryParams.taxonName ? this.route.snapshot.queryParams.taxonName : this.resolveTitle() 
        if(this.router.url.includes('taxon')){
          const taxonId = this.router.url.split("?")[0].replace(/\D+/,"")
          this.taxonBanner = this.taxonsService.categories?.map((moment) => {
            return moment.id
          }).includes(taxonId) ?
          this.getTaxonBanner(taxonId) :
          null
        }
      }
      this.activeHeader = true;

      if(!this.router.url.includes('taxon')){
        this.taxonBanner = false;
      }

      if( this.router.url.includes('/login') || this.router.url.includes('/registration') || this.router.url.includes('greetings')){
        this.activeHeader = false;
      }

      if(this.router.url.includes('/menu') || this.router.url.includes('/menu')){
        this.activeHeader = false;
      }

      if(this.router.url.includes('/profile')){
        this.activeHeader = false;
      }

      if(this.router.url.includes('/addresses')){
        this.activeHeader = false;
      }
      
      if(this.router.url.includes('/about-you')){
        this.activeHeader = false;
      }

      if(this.router.url.includes('/payment-methods')){
        this.activeHeader = false;
      }

      if(this.router.url.includes('/create-payment-card')){
        this.activeHeader = false;
      }

      if(this.router.url.includes('/new-payment-card')){
        this.activeHeader = false;
      }

      if (!(this.router.url.includes('home') || this.router.url.includes('search'))) {
        this.searchOpen = false;
      }
    })
  }

  getTaxonBanner(taxonId) {
    if(!this.router.url.includes('taxon')){
      return 'white'
    } else {
      return 'url(assets/images/moments/'+taxonId+'.png)'
    }
  }

  async initializeItems(address) {
    if (this.address && this.address.id === address.id) return;
    const st = await this.nativeStorage.get('stockLocations');
    const url = environment.host + '/autocomplete/products.json?stock_locations=' + st;

    return this.http.get(url).subscribe((resp: any) => {
      this.nativeStorage.set('searchProducts', resp).then();
    });
  }

  checkInput(input){
    this.searching = input.detail.srcElement.value != ''
  }

  public async getItems(ev: any) {
    this.keyword = ev.detail.value
    this.searchService.currentSearch$.next(this.keyword)
    const val = ev.detail.value;
    const condition = new RegExp(val.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase());
    if (val && val.trim() !== '' && val.length >= 3) {
      this.nativeStorage.get('searchProducts').then((items)=>{
        this.isItemAvailable = true;
        this.items = items.filter((item) => {
          const string = item.n + item.p + item.t + item.k;
          return condition.test(string.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase());
        }).reverse();
        debugger
        return
        const options = {
          include: 'images,variants',
          keywords: this.keyword,
          page: 1,
          perPage: 12
        }
        this.productService.getProducts(options, true).then(products => {
          this.searchService.searchProducts$(products.data);
          const productsFound = products.data.map((product)=>{
            return product.id
          })
          this.userEventsService.userEvents['product_searched.loaded'].track({
            keyword_searched: this.keyword,
            products_id: productsFound,
          })

        })
      })
    }
    else {
      this.items = [];
      this.isItemAvailable = false;
    }
  }

  goBack(){
    this.searchService.currentSearch$.next(null);
    this.searchService.searchBarOpened$.next(false)
    setTimeout(()=>{
      this.items = [];
      this.taxonBanner = null
    },200)
    if(this.router.url.includes('checkout')){
      this.router.navigateByUrl('tabs/home')
    }
    this.navController.pop()
  }

  clear() {
    this.items = [];
    this.taxonBanner = undefined
  }

  cleanSearch(searchElement){
    this.searching = false
    searchElement.value = null
  }

  onSearch(item, taxonId = null) {
    this.userEventsService.userEvents.productsSearched.track({
      "query": item,
      //"attributes" : JSON.stringify(this.product.attributes, null, 2),
    })
    const options:any = {
      include: 'images,variants',
      keywords: item.n || item,
      page: 1,
      perPage: 12
    }
    taxonId ? options.taxon = taxonId : null
    this.productService.getProducts(options, true).then(products => {
      this.modalService.openProduct(products.data[0])
    });
  }

  async openCart() {
    this.userEventsService.userEvents['cart.clicked'].track()
    this.router.navigate(['cart'])
  }

  public openSearch() {
    this.userEventsService.userEvents['search_bar.clicked'].track()
    if(this.router.url.includes('/search')){
      this.router.navigateByUrl('/tabs/home')
      this.searchOpen = false
      return
    }
    this.searchOpen = !this.searchOpen;
    this.searchService.searchBarOpened$.next(this.searchOpen);
    if(this.searchOpen){
      setTimeout(()=>{
        this.searchElement.value = this.keyword
  
        this.searchElement.setFocus()
      },250)
    } else {
      this.keyword = "";
    }
  }

  resolveTitle() {
    var urlArray = this.router.url.split('/');
    var type = urlArray.pop();
    var id = null;
    if(type.includes("order_token")){
      return "Tu orden"
    }
    if(!isNaN(parseInt(type))) {
      id = parseInt(type);
      var type = urlArray.pop();
    }
    switch (type) {
      case 'login':
      case 'registration':
        this.activeHeader = false;
        break;
      case 'home':
        return '';
        break;
      case 'products':
        return 'Categorías';
        break;
      case 'sales':
        return 'Ofertas';
        break;
      case 'discover':
        return 'Descubre';
        break;
      case 'menu':
        return 'Menu';
        break;
      case 'orders':
        return 'Pedidos';
        break;
      case 'lomibox':
        return 'Lomi-Mix';
        break;
      case 'recepies':
        return 'Lomi recetas';
        break;
      case 'checkout':
        return 'Finalizar pedido';
        break;
      case 'checkout-kushki':
        return 'Finalizar pedido';
        break;
      case 'taxon':
        if (this.taxon) {
          return this.taxon.name || this.taxon.attributes?.name;
        } else {
          return '';
        }
        break;
      case 'product':
        var product = this.productService.productList[id];
        if (product) {
          return product.attributes.name;
        } else {
          return '';
        }
        break;
      case 'producers':
        if (id) {
          return 'Productor';
        }
        else {
          return 'Productores';
        }
        break;
      case 'cart':
        return 'Mi carrito';
        break;
      default:
        return '';      
    }
  }

  emptyCart(){
    this.cartService.emptyCart();
  }

  hiddenElements() {
    const product = this.productService.activeModalProduct$.getValue();
    const hidden = ['checkout','menu', 'login', 'registration', 'success', 'orders', 'cart',];
    return this.router.url.includes('checkout') || this.router.url.includes('cart') || this.router.url.includes('orders') || !hidden.includes(this.router.url.split('/')[1])  || !product;
  }
  
  search($event, q: string) {

    const code = $event.keyCode || $event.which;
    const options = {
      include: 'images,variants',
      keywords: $event.srcElement.value,
      page: 1,
      perPage: 12,
      
    }
    
    if (code === 13) {
    this.productService.getProducts(options, true).then(products => {
      const productsFound = products.data.map((product)=>{
        return product.id
      }).join(",")
      this.userEventsService.userEvents['product_searched.expanded'].track({
        keyword_searched: this.keyword,
        products_id: productsFound,
      })
      this.searchService.searchProducts$(products.data);
      this.router.navigateByUrl('/search', {
        
      })
    });
  }
  }
}
