import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
})
export class ProductsListComponent implements OnInit {

  @Input() products;

  constructor() {}

  openProduct(product: any){
    console.log("Open product")
    //TODO: Open product when clicked
  }

  ngOnInit() {
    console.log(this.products)
  }

}
