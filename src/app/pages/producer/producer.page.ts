import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalProductComponent } from '../../modals/product/modal-product.component';
import { ModalController } from '@ionic/angular';
import { ProducersService } from '../../services/producers.service';
import { ProductsService } from '../../services/products.service';
import { ModalsService } from 'src/app/services/modals.service';

@Component({
  selector: 'app-producer',
  templateUrl: './producer.page.html',
  styleUrls: ['./producer.page.scss'],
})
export class ProducerPage implements OnInit, OnDestroy {
  id: number;
  private sub: any;
  producer;
  products;

  constructor(private route: ActivatedRoute,
              private modalCtrl: ModalController,
              private modalsService: ModalsService,
              private productsService: ProductsService,
              private producersService: ProducersService) {
  }

    async openProduct(product) {
      this.modalsService.openProduct(product)  
    }

  ngOnInit() {
    window.analytics.page('producer');
    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id']
      this.producersService.getProducer(this.id).subscribe((resp: any) => {
        this.producer = resp;
        this.productsService.activeModalTaxon$.next(resp);
        this.getProducers();
      });
    });
  }

  getProducers() {
    const options = {
      include: 'images,variants',
      producer: this.id.toString(),
      page: 1,
      perPage: 25
    }

    this.productsService.getProducts(options).then(resp => {
      this.products = resp.data;
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  async onProductSelected(product) {
    this.modalsService.openProduct(product)
    const modal = await this.modalCtrl.create({
      component: ModalProductComponent,
      canDismiss: true,
      cssClass: 'modal-class',
      componentProps: { product }
    });

    await modal.present();
  }
}
