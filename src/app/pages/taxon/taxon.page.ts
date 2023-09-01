import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaxonsServices } from '../../services/taxons.services';
import { Utils } from '../../../utils/util';
import { ProductsService } from '../../services/products.service';
import { ModalController, NavController } from '@ionic/angular';
import { AnimationOptions } from 'ngx-lottie';
import { ModalProductComponent } from 'src/app/modals/product/modal-product.component';
import { ModalsService } from 'src/app/services/modals.service';
import { SearchService } from 'src/app/services/search.service';
import { IonTabs } from '@ionic/angular';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { partial } from 'lodash';
const MOMENTS = {
  "1698" : {
    img : "antojoApp.png",
    name: "Antojo",
    color: "#FFDEEC",
    shade: "#FF002C"
  },
  "1700" : {
    img: "asadoApp.png",
    name: "Asado",
    color: "#FF8976",
    shade: "#930300"
  },
  "1696" : { 
    img: "veggieApp.png",
    name: "Veggie",
    color: "#E9FF65",
    shade: "#2E7919"
  },
  "1701" : { 
    img: "desayunoApp.png",
    name: "Desayuno",
    color: "#FFD062",
    shade: "#631E04"
  },
  "1702" : {
    img: "picoteoApp.png",
    name: "Picoteo",
    color: "#F8A0FA",
    shade: "#5E001D"
  },
  "1703" : {
    img: "flojeraApp.png",
    name: "Flojera"
  }
}



@Component({
  selector: 'app-taxon',
  templateUrl: './taxon.page.html',
  styleUrls: ['./taxon.page.scss'],
})
export class TaxonPage implements OnInit, OnDestroy {
  currentSection = 'section1';
  public links;
  public moments;
  public taxon;
  public taxonBanner;
  public loading = false;
  public isEmpty = false;
  public taxonsChildren = [];
  public products = new Array(10);
  public selectedChild;
  public keywords = "";
  private sub: any;
  showTertiaryLayer = false
  parentId
  tertiaryLayer = []

  @Input() id;


  constructor(private route: ActivatedRoute,
              private modalCtrl: ModalController,
              private taxonsService: TaxonsServices,
              public router: Router,
              private modalsService: ModalsService,
              public navCtrl: NavController,
              public activatedRoute: ActivatedRoute,
              private productsService: ProductsService,
              private searchService: SearchService,
              private userEventsService: UserEventsService,
            ) {
    this.sub = this.route.params.subscribe(params => {
      if(params['id']){
        this.id = params['id'];
        this.parentId = this.id
        this.getTaxons();
        this.updateProducts(this.id)
      }
    });
    this.router.events.subscribe((event)=>{
      this.taxonsChildren = []
    })
  }
  

  updateProducts(taxonId, isSecondaryChild = false, hideChild = false){
    this.showTertiaryLayer = isSecondaryChild
    if (this.showTertiaryLayer) this.parentId = taxonId
    if (hideChild) this.tertiaryLayer = []
    this.products = []
    this.setProducts(taxonId);
    if (this.showTertiaryLayer) this.getTertiaryLayer(taxonId)
  }

  ngOnInit() {

    /**
     * Filter
    this.searchService.currentSearch$.subscribe((keyword)=>{
      this.keywords = keyword;
      if(this.keywords){
        this.updateProducts(this.selectedChild)
      }
    })
     */
    // this.updateProducts(this.id)
    window.analytics.page('taxon');
  }
  goBack(){
    this.navCtrl.pop();
  }

  ngOnDestroy() {
    this.searchService.currentSearch$.next(null)
    this.sub.unsubscribe();
    //this.taxonBanner = null;
    //this.taxonsChildren = []
  }

  getTaxonBanner(){
    return "url(assets/images/moments/"+this.taxon.id+".png)"
  }

  stringParameterize(str) {
    return Utils.stringParameterize(str);
  }

  async getTertiaryLayer(id) {
    const taxonResponse = await this.taxonsService.getTaxons({
      filter: {
        ids: id
      },
      include: 'children'
    })
    if (!taxonResponse.data[0].attributes.is_child) return this.tertiaryLayer = []
    const taxons = taxonResponse.included.filter(el => el.type === 'taxon').filter(taxon => !taxon.attributes.hide_from_nav)
    this.tertiaryLayer = taxons ? taxons : [];
    this.tertiaryLayer.forEach(this.productsService.checkIfTaxonHaveProducts)
  }

  getTaxons() {
    this.taxonsService.getTaxons({
      filter: {
        ids: this.id
      },
      include: 'children'
      //depth: '1',
      //per_page: 50
    }).then(resp => {
      this.taxon = resp.data[0];
      this.taxonsService
      this.setChildren(resp);
      this.taxonsService.categories?.map((moment)=>{
        return moment.id
      }).includes(this.taxon.id)?
      this.taxonBanner = this.getTaxonBanner() :
      this.taxonBanner = null

    })
  }

  setChildren(taxonResponse) {
    const taxons = taxonResponse.included.filter(el => el.type === 'taxon');
    this.taxonsChildren = taxons ? taxons : [];
    this.taxonsChildren.forEach(this.productsService.checkIfTaxonHaveProducts)
  }

  async onProductSelected(product) {
  const modal = await this.modalCtrl.create({
    component: ModalProductComponent,
    canDismiss: true,
    cssClass: 'modal-class',
    componentProps: { product },
  });

  await modal.present();
}

  async openProduct(product) {
  if(!product){
    return
  }
  this.modalsService.openProduct(product);
  return
  const activeModalProduct = this.productsService.activeModalProduct$;
  const activeModalTaxon = this.productsService.activeModalTaxon$;
  activeModalProduct.next(product);
  if(!activeModalProduct.getValue()){
  }
  else if (this.taxon) activeModalTaxon.next(this.taxon);
  await this.onProductSelected(product);
}


  async logScrolling($event) {
    if ($event.target.localName != "ion-content") {
      return;
    }

    const scrollElement = await $event.target.getScrollElement();
    const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;
    const currentScrollDepth = $event.detail.scrollTop;
    const targetPercent = 80;
    let triggerDepth = ((scrollHeight / 100) * targetPercent);

    if (currentScrollDepth > triggerDepth) {
      if (!this.loading && (+this.links.self !== +this.links.total)) {
        this.setProducts(this.selectedChild, this.links.next, 12);
        this.loading = true;
      }
    }
  }

  setProducts(taxonId, page = 1, perPage = 12) {
    this.selectedChild = taxonId
    const options:any = {
      include: 'images,variants',
      taxonIds: taxonId,
      page,
      perPage
    }
    if(this.keywords) options.keywords = this.keywords;
    this.productsService.getProducts(options).then(resp => {
      var forSegment = resp.data.map( (obj, index) => {
        return {
          "id" : obj.id,
          "product" : obj?.attributes.name,
          "index" : index + 1,
          "image" : obj.images[0]?.attributes.cdn_url
        };
      });
      console.log(resp,"respo")
      this.productsService.activeModalTaxon$.next(resp.data)
      this.userEventsService.userEvents.productListViewed.track({
        "taxonId": this.selectedChild,
        "data" : forSegment,
      });
      this.isEmpty = !resp.data.length;
      if (this.products.length < resp.meta.total_count) this.products.push(...resp.data);
      this.links = {
        prev: +Utils.getUrlParam(resp.links.prev, 'page'),
        next: +Utils.getUrlParam(resp.links.next, 'page'),
        self: +Utils.getUrlParam(resp.links.self, 'page'),
        total: +resp.meta.total_pages,
      }
      this.loading = +this.links.self === +this.links.total;
    });
  }
}

