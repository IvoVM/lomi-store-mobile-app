import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ProductsService } from '../../../services/products.service';
import { Utils } from '../../../../utils/util';
import { IonSlides } from '@ionic/angular/directives/proxies';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { from } from 'rxjs';
import { AddressService } from 'src/app/services/address.service';
import { ModalProductComponent } from 'src/app/modals/product/modal-product.component';
import { ModalsService } from 'src/app/services/modals.service';

@Component({
  selector: 'app-product-slides',
  templateUrl: './product-slides.component.html',
  styleUrls: ['./product-slides.component.scss'],
})
export class ProductSlidesComponent implements OnInit, OnDestroy {
  @Input() taxon;
  @Input() product;
  @Input() producer;
  @Input() minimalQuantity;
  @Input() hideIfDoesntLoaded = false;
  @Input() showDivider = false;
  
  links;
  modal;
  addressActive;
  productId;
  producerResponse;
  loadedTaxon = false;
  firstLoadProducts = false;
  currentStockLocation;

  slideLoad = false;
  slideOpts = {
    initialSlide: 0,
    speed: 800,
    freeMode: true,
    mousewheel: {
      releaseOnEdges: true,
    },
    slidesPerView: 3,
    spaceBetween: 12,

  };
  public offset = 7;
  products = [
    [], [], [], [], [], [], []
  ];
  productsCarrousel = [
    null, null, null, null, null, null
  ];
  loading = false;
  isEnd = false;
  @ViewChild('mySlider') slides: IonSlides;

  public slidesNumber: Array<number>;
  public slideIndex: number;
  public slideLoaded: boolean;
  public addingSlide: boolean = false;

  constructor(private productsService: ProductsService,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private router: Router,
    private addressService: AddressService,
    private modalsService:ModalsService
  ) {
  }

  public ionSlidesDidLoad(): void {
    this.slideLoaded = true;
  }

  public ionSlideNextEnd() {
    if (this.addingSlide || !this.slideLoaded) {
      return;
    }
    this.slides.getActiveIndex().then(async (index: number) => {
      let prevIndex = await this.slides.getPreviousIndex();
      let indexDelta = Math.abs(index - prevIndex)
      let productsIndex = this.productsCarrousel.length % this.products.length
      this.addPortion(productsIndex, indexDelta)
      return
      index + indexDelta > this.products.length - 1 ? console.log(productsIndex + indexDelta, "r") : console.log(this.products.length - (productsIndex + indexDelta), "r", indexDelta - (this.products.length - (productsIndex + indexDelta)))
      this.productsCarrousel = this.productsCarrousel.concat(this.products.slice(index % this.products.length, index + indexDelta))
      this.slideIndex = index;
    });
  }

  public addPortion(fromIndex, quantity, _switch = true) {
    let shortQuantity = _switch ? (fromIndex + quantity) - (this.products.length) : (fromIndex - quantity)
    if (_switch ? shortQuantity > 0 : shortQuantity < 0) {
      this.productsCarrousel = _switch ? this.productsCarrousel.concat(this.products.slice(fromIndex, this.products.length)) : this.products.slice(0, fromIndex).concat(this.productsCarrousel)
      quantity = quantity - shortQuantity
      fromIndex = _switch ? 0 : this.products.length
      this.productsCarrousel = _switch ? this.productsCarrousel.concat(this.products.slice(fromIndex, fromIndex + shortQuantity)) : this.products.slice(fromIndex, fromIndex + shortQuantity).concat(this.productsCarrousel)
    } else {
      this.productsCarrousel = _switch ? this.productsCarrousel.concat(this.products.slice(fromIndex, fromIndex + quantity)) : this.products.slice(fromIndex - quantity, fromIndex).concat(this.productsCarrousel)
    }
  }

  public ionSlidePrevEnd() {
    return
    if (this.addingSlide || !this.slideLoaded) {
      return;
    }
    this.slides.getActiveIndex().then(async (index: number) => {
      let prevIndex = await this.slides.getPreviousIndex();
      let indexDelta = Math.abs(index - prevIndex)
      let productsIndex = prevIndex % this.products.length
      console.log("Index:", prevIndex, indexDelta)
      this.addingSlide = true;
      this.addPortion(productsIndex, indexDelta, false)
      this.slides.slideTo(index + 1)
      this.addingSlide = false;
    });
  }

  ngOnInit() {
    if (this.addressActive) {
      this.addressActive.unsubscribe();
    }
    this.firstLoadProducts = true;
    
    this.addressActive = this.addressService.activeAddress$.subscribe((res:any) => {
      if(this.currentStockLocation && this.currentStockLocation?.join(",") != res.stockLocationId?.join(",")){
        console.log(this.currentStockLocation?.join(","), res.stockLocationId?.join(","))
        this.firstLoadProducts = true;
      }
      this.currentStockLocation = res.stockLocationId;

      if (this.firstLoadProducts) {
        this.productsCarrousel = [null, null, null, null, null]
        this.getProducts();
        this.firstLoadProducts = false;
      }
    })

    this.getProducts();

    //setTimeout(() => this.slides?.update().then(), 3000)
  }

  getProducts() {
    if (this.taxon) this.getProductsByTaxon(this.taxon).then();
    if (this.producer) this.getProductByProducer();
    this.route.params.subscribe(params => {
      this.productId = params['id'];
    });
  }

  ngOnDestroy() {
    this.addressActive.unsubscribe();
  }

  async getProductsByTaxon(taxon) {
    let products = await this.productsService.getProductsByTaxon(taxon, 1, 12)
    this.products = products.data
    this.productsCarrousel = [...this.products]
    this.loadedTaxon = true;
  }

  getProductByTaxon() {
    this.productsService.getActiveFeaturedProducts$().subscribe(products => {
      if (products && products.length) {
        // @ts-ignore
        const filter = products.find(p => +p.taxonId === +this.taxon.id)
        // @ts-ignore
        if (filter) this.products = filter.data;
        this.productsCarrousel = [...this.products.slice(0, 6)]
        this.loadedTaxon = true;
      }
    });
  }

  getProductByProducer(page = 1, perPage = 4, forceRequest = false) {
    if (this.producer || forceRequest) {
      const options = {
        include: 'images,variants',
        producer: this.producer.id,
        page,
        perPage
      }
      this.fetchProducts(options);
    }
  }

  fetchProducts(options) {
    this.productsService.getProducts(options, !!this.taxon).then(resp => {
      this.setProducts(resp);
    })
  }

  setProducts(resp) {
    this.producerResponse = resp;
    if (!this.productsCarrousel || !this.productsCarrousel[0]) this.productsCarrousel = [];
    this.productsCarrousel.push(...resp.data);

    this.links = {
      self: +Utils.getUrlParam(resp.links.self, 'page'),
      next: +Utils.getUrlParam(resp.links.next, 'page'),
      total: +resp.meta.total_pages,
    }

    this.loading = +this.links.self === +this.links.total;


    if (this.products.length === resp.meta.total_count) {
      this.isEnd = true;
      return
    }

    if (this.slides) {
      this.slides.isEnd().then(resp => {
        this.isEnd = (resp && this.loading)
      });
    }
  }

  async ionSlideTransitionEnd() {
    if (this.slideLoad) {
      this.newSlides();
    }
  }

  slidePrev() {
    this.slides.slidePrev().then();
  }

  slideNext() {
    this.slides.slideNext().then();
    this.newSlides();
  }

  newSlides() {
    this.slides.isEnd().then(resp => {
      if (resp && !this.loading && !this.isEnd && !this.taxon) {
        if (this.producer && this.links) this.getProductByProducer(this.links.next, 4, true);
        this.loading = true;
      }
    });
  }
  async openProduct(product) {
    this.modalsService.openProduct(product);
  }
}
