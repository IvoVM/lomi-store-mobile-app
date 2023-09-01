import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../services/products.service';
import { breakpoints } from '../breakpoints';
import { ModalsService } from '../services/modals.service';

@Component({
  selector: 'app-upselling',
  templateUrl: './upselling.component.html',
  styleUrls: ['./upselling.component.scss'],
})
export class UpsellingComponent implements OnInit {

  public products:any = [];

  constructor(
    private productsService:ProductsService,
    private modalsService:ModalsService
  ) { }

  async ngOnInit() {
    const products = await this.productsService.getProducts({
      include: 'variants,images',
      taxonIds: "1698",
      perPage: 100
    })
    const productsQuantity = window.innerHeight <= breakpoints.iphoneSE.height ? 3 : 6
    const initNumber = Math.floor(Math.random() * products.data.length - productsQuantity)
    this.products = products?.data.splice(initNumber, productsQuantity)
  }

  async dismissModal(){
    this.modalsService.dismissTopModal();
  }

}
