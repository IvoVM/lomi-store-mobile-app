import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-modal-product',
  templateUrl: './modal-product.component.html',
  styleUrls: ['./modal-product.component.scss']
})
export class ModalProductComponent implements OnInit {
  @Input() producer;
  @Input() product;
  producerResponse;
  id;

  constructor(private router:Router , private modalCtrl: ModalController, private productsService: ProductsService) {

  }
  
  ngOnInit() {
    console.log(this.product)
  }

  ngOnDestroy(){
  }

  async dismiss() {
    await this.modalCtrl.dismiss();
  }
}
