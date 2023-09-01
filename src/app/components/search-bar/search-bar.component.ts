import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProductsService } from 'src/app/services/products.service';
import { SearchService } from 'src/app/services/search.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { ModalsService } from 'src/app/services/modals.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit {

  keyword = ''
  isItemAvailable = false;
  items = [];
  searching = false;

  constructor(
    private searchService: SearchService,
    private nativeStorage: Storage,
    private productService: ProductsService,
    private userEventsService: UserEventsService,
    private modalService: ModalsService,
    public router: Router
  ) { }

  ngOnInit() { 
  }

  checkInput(input){
    this.searching = input.detail.srcElement.value != ''
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


  async getItems(ev: any) {
    this.keyword = ev.detail.value
    this.searchService.currentSearch$.next(this.keyword)
    const val = ev.detail.value;
    const condition = new RegExp(val.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase());
    if (val && val.trim() !== '' && val.length >= 3) {
      this.nativeStorage.get('searchProducts').then((items) => {
        this.isItemAvailable = true;
        this.items = items.filter((item) => {
          const string = item.n + item.p + item.t + item.k;
          return condition.test(string.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase());
        }).reverse();
      })
    }
    else {
      this.items = [];
      this.isItemAvailable = false;
    }
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
        const productsFound = products.data.map((product) => {
          return product.id
        }).join(",")
        this.userEventsService.userEvents['product_searched.expanded'].track({
          keyword_searched: this.keyword,
          products_id: productsFound,
        })
        this.searchService.searchProducts$(products.data);
        this.router.navigateByUrl('/search', {

        }).then(() => {
          this.clear($event.srcElement)
        })
      });
    }
  }

  clear(searchElement) {
    this.items = [];
    this.searching = false
    searchElement.value = null
  }

}
