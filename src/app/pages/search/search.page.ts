import { Component, OnInit, OnDestroy, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { ProductsService } from '../../services/products.service';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { ModalProductComponent  } from 'src/app/modals/product/modal-product.component';
import { ModalsService } from 'src/app/services/modals.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  keyword;
  products = [];
  page = 2;
  loading = false;
  keywordClone = ''
  lastTaxon;

  constructor(
    private modalCtrl: ModalController,
    private searchService: SearchService,
    private modalsService: ModalsService,
              private productsService: ProductsService) {
  }

  ngOnInit() {
    this.keyword = this.searchService.currentSearch$.value
    this.lastTaxon = this.productsService.activeModalTaxon$.getValue()
    this.productsService.activeModalTaxon$.next('search');
    this.searchService.searchBarOpened$.next(false);
    this.searchService.products$.subscribe(products => {
      this.products = products;
    })
  }

  ngDoCheck(): void {
    this.compareKeyWords()
  }

  ngOnDestroy(){
    this.searchService.searchBarOpened$.next(false);
    this.searchService.currentSearch$.next("");
    this.productsService.activeModalTaxon$.next(this.lastTaxon);
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
    console.log(activeModalProduct.getValue(), product)
    activeModalProduct.next(product);
    if(!activeModalProduct.getValue()){
    }
    await this.onProductSelected(product);
  }

  loadData() {
    this.loading = true
    setTimeout(() => {
      this.infiniteScroll.complete()
      this.loading = false
      this.loadProducts(this.page)
    }, 500);
    this.compareKeyWords()
    return this.page +=1
  }
  
  loadProducts(page) {
    this.keyword = this.searchService.currentSearch$.value
    const options = {
      include: 'images,variants',
      keywords: this.keyword,
      page: page,
      perPage: 12
    }
    
    this.productsService.getProducts(options, true).then(products => {

    this.products.push(...products.data);
      if (Object.values(products.data).length < 12) {
        this.infiniteScroll.disabled = true
      } else {
        this.infiniteScroll.disabled = false
      }
    })
  }


  compareKeyWords() {
    this.keywordClone = this.searchService.currentSearch$.value
    if (!this.keyword || !this.keywordClone) return
    if (this.keyword !== this.keywordClone) {
      this.keywordClone = this.keyword;
      this.infiniteScroll.disabled = false
      return this.page = 2
    }
  }

}
