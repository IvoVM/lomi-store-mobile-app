import { Injectable } from '@angular/core';
import { SecurityProvider } from './security.service';
import { BehaviorSubject } from 'rxjs';
import { Utils } from '../../utils/util';
import { TaxonAttr } from '@spree/storefront-api-v2-sdk/types/interfaces/Taxon';
import { TaxonAttrLomi } from 'types/taxons';
import { RelationType } from '@spree/storefront-api-v2-sdk/types/interfaces/Relationships';
import { colorPalette } from 'src/utils/colors';
import { ProductsService } from './products.service';

@Injectable({
  providedIn: 'root'
})
export class TaxonsServices {
  public activeTaxons$ = new BehaviorSubject<[]>([]);
  public moments;
  public categories;
  public currentTaxonName;
  public categoriesHydrated = false;

  public taxonsList = {};

  constructor(private securityProvider: SecurityProvider, private productsService: ProductsService) {
  }

  getActiveTaxons() {
    return this.activeTaxons$.getValue();
  }

  setActiveTaxons(taxons) {
    this.activeTaxons$.next(taxons);
  }



  
  async fetchRootTaxons(): Promise<{data: TaxonAttrLomi[], included: any}>{
    return await Utils.sessionCachedFunction('rootTaxons', async () => {
      if(sessionStorage.getItem('rootTaxons')){
        return JSON.parse(sessionStorage.getItem('rootTaxons'))
      }
  
      let options = {
        filter: {
          roots: true
        },
        per_page: 200,
        include: "image_button,taxonomy"
      }
      const response = await this.securityProvider.getClient().taxons.list(options);
      const rootTaxons = response.success().data
      if(rootTaxons){
        sessionStorage.setItem('rootTaxons', JSON.stringify(rootTaxons))
      }
      return response.success()
    })
  }

  async fetchCategories(){
      const rootTaxons = await this.fetchRootTaxons()
      console.log(rootTaxons)
      const categories = rootTaxons.data.filter(taxon => !taxon.attributes.hide_from_nav).map((taxon, index) => {
        const taxonImg = Utils.getIncluded(rootTaxons, "image").find(image => image.id === (taxon.relationships.image_button.data as RelationType)?.id);
        return {
          color: colorPalette[index % colorPalette.length],
          image: taxonImg?.attributes.cdn_url,
          ...taxon
        }
      })
      const sortedCategories = categories.sort((category1:TaxonAttrLomi, category2:TaxonAttrLomi) : any => {
        const taxonomy1 = Utils.getIncluded(rootTaxons, "taxonomy").find(taxonomy => taxonomy.id === (category1.relationships.taxonomy.data as RelationType).id);
        const taxonomy2 = Utils.getIncluded(rootTaxons, "taxonomy").find(taxonomy => taxonomy.id === (category2.relationships.taxonomy.data as RelationType).id);
        return taxonomy1.attributes.position - taxonomy2.attributes.position
      })
      this.categories = sortedCategories
      console.log(this.categories)
      await this.hydrateCategories()
      return
  }

  async hydrateCategories(){
    await Promise.all(this.categories.map(async category => {
      const taxon = await this.getTaxon(category.id)
      const childrens = taxon.included.filter(included => included.type === "taxon")
      const taxonProducts = [...taxon.data.relationships.products.data]
      if(childrens.length){
        childrens.forEach(child => {
          const childProducts = child.relationships.products.data
          taxonProducts.push(...childProducts)
        })
      }
      category.childs = childrens
      category.allProducts = taxonProducts
      await this.hydrateProducts(category)
      return category
    }))
    this.categoriesHydrated = true
  }

  async hydrateProducts(category){
    const rootProducts = await this.productsService.getProductsByTaxon(category.id)
    Promise.all(category.childs.map(async child => {
      return this.productsService.getProductsByTaxon(child.id)
    })).then(childrenProductsRaw => {
      const childProducts = childrenProductsRaw.reduce((acc, val) => acc.concat(val.data), [])
      category.products = [...rootProducts.data, ...childProducts]
      console.log(category.products.length,category)
      category.childProducts = childrenProductsRaw
    })
  }

  async fetchMoments(){
    const rootTaxons = await this.fetchRootTaxons()
    const categories = rootTaxons.data.filter(taxon => taxon.attributes.show_into_home)
    const sortedCategories = categories.sort((category1:TaxonAttrLomi, category2:TaxonAttrLomi) : any => {
      const taxonomy1 = Utils.getIncluded(rootTaxons, "taxonomy").find(taxonomy => taxonomy.id === (category1.relationships.taxonomy.data as RelationType).id);
      const taxonomy2 = Utils.getIncluded(rootTaxons, "taxonomy").find(taxonomy => taxonomy.id === (category2.relationships.taxonomy.data as RelationType).id);
      return taxonomy1.attributes.position - taxonomy2.attributes.position
    })
    this.moments = sortedCategories
  }
  
  async getTaxon(taxonId){
    if(this.taxonsList[taxonId]){
      return this.taxonsList[taxonId]
    }
    let taxon = await this.securityProvider.getClient().taxons.show(taxonId,{
      include: "children"
    })
    if(taxon && taxon?.isSuccess()){
      this.taxonsList[taxonId] = taxon.success()
      return taxon?.success()
    } 
  }

  async taxonHaveProducts(){
    
  }


  async getTaxons(options = {}, featured = null) {
    const response = await this.securityProvider.getClient().taxons.list(options);
    if (featured) {
      this.setTaxons(response.success().data)
    }
    return response.success();
  }

  setTaxons(taxons) {
    const activeTaxons = taxons;
    activeTaxons.map(t => this.setActiveTaxons(Utils.addItemToArrayById(activeTaxons, t)));
  }
  
}
