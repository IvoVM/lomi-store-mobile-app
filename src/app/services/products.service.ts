import { Injectable } from '@angular/core';
import { SecurityProvider } from './security.service';
import { BehaviorSubject } from 'rxjs';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { ProductDetailComponent } from '../components/product/product-detail/product-detail.component';
import { ModalController } from '@ionic/angular';
import { ModalProductComponent } from '../modals/product/modal-product.component';
import { Utils } from 'src/utils/util';
import { SearchService } from './search.service';
import { ModalsService } from './modals.service';

export interface IProductOptions {
  include?: string;
  producer?: string | string[];
  taxonIds?: string | string[];
  stockLocationIds?: string | string[];
  productIds?: string | string[];
  keywords?: string;
  page?: number;
  perPage?: number;
  ids?: string
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  public activeFeaturedProducts$ = new BehaviorSubject<[]>([]);
  public activeModalProduct$ = new BehaviorSubject<any>(null);
  public activeModalTaxon$ = new BehaviorSubject<any>(null);
  productList = {};
  taxonsList = {};

  constructor(
    private modalCtrl:ModalController,
    private router: Router,
    private modalsService:ModalsService,
    private securityProvider: SecurityProvider,
    private nativeStorage: Storage,
    private searchService: SearchService) {
  }

  checkIfTaxonHaveProducts = async (taxon) => {
    if(taxon.id){
      let res = await this.getProductsByTaxon(taxon.id)
      taxon.haveProducts = new Boolean(res.included.length);
    }
  }

  async getProductById(productId){
    let productResponse = await this.securityProvider.getClient().products.show(
      productId,
      this.securityProvider.getAccessToken() ?? '',
      {include: 'variants,images'}
      )
      if(productResponse.isSuccess()){
        const product = productResponse.success()
        product.data.variants = Utils.getIncluded(product,'variant')
        product.data.images = Utils.getIncluded(product,'image')
        return product.data;
      } else {
        console.error(productResponse.fail())
        return null
      }

  }

  getActiveFeaturedProducts$() {
    return this.activeFeaturedProducts$;
  }

  getActiveFeaturedProducts() {
    return this.activeFeaturedProducts$.getValue();
  }

  setActiveProducts(products) {
    this.activeFeaturedProducts$.next(products);
  }

  async getProducts(options: IProductOptions, featured = null) {
    const objFilter = {};;

    if (options.taxonIds) objFilter['taxon'] = options.taxonIds + '';
    const st = await this.nativeStorage.get('stockLocations');
    if (st) objFilter['stock_location_ids'] = st;
    if (options.producer) objFilter['producer'] = options.producer;
    if (options.keywords) objFilter['keywords'] = options.keywords;
    if(options.ids) {
      objFilter["ids"] = options.ids;
    delete options.ids
  }
    options['filter'] = objFilter;
    if (options.include) options['include'] = options.include;
    if (options.page) options['page'] = options.page;
    if (options.perPage) options['per_page'] = options.perPage;
    // sortname
    options['sort'] = 'id';
    const response = await this.securityProvider.getClient().products.list({},options);
    if(response.isFail()){
      console.error(response.fail())
    }
    return this.parseProducts(response.success(), options.taxonIds, featured);
  }

  async parseProducts(response, taxonId = null, featured = null) {
    const st = await this.nativeStorage.get('stockLocations');
    if(!response){
      return
    }
    const images = response.included.filter(i => i.type === 'image');
    const variants = response.included.filter(i => i.type === 'variant')
    const products = response.data;
    const activeProducts = this.getActiveFeaturedProducts();

    response.data = products.map(p => {
      const pImages = [];

      if (p.relationships) {
        p.relationships.images?.data.forEach(i => {
          pImages.push(...images.filter(p => +p.id === +i.id));
        });
        p.images = pImages;

        const pVariants = [];
        p.relationships.variants?.data.forEach(i => {
          pVariants.push(...variants.filter(p => +p.id === +i.id && p.attributes.purchasable));
        });
        p.variants = pVariants;
        this.productList[p.id] = p;
      }
      return p;
    }).filter((p)=>p.variants.length >= 1)


    response.taxonId = taxonId;
    this.setActiveProducts([...activeProducts, response])
    return response;
  }

  async flushProducts() {
    this.productList = {};
    this.taxonsList = {};
  }

  async getProductsByTaxon(taxonId, page = 1, perPage = 12) {
    if(!this.taxonsList[taxonId]){
      this.taxonsList[taxonId] = {}
    }
    if(this.taxonsList[taxonId][page]){
      return this.taxonsList[taxonId][page]
    }
    if(typeof taxonId == typeof {}){
      console.error("Taxon in an object",taxonId)
      return
    }
    const options:any = {
      include: 'images,variants',
      taxonIds: taxonId,
      page,
      perPage
    };
    if(this.searchService.currentSearch){
      options.keywords = this.searchService.currentSearch;
    }
    let products = await this.getProducts(options, true);
    this.taxonsList[taxonId][page] = products;
    return products;
  }

}
