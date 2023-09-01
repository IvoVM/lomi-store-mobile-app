import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent, ModalController } from '@ionic/angular';
import { ModalProductComponent } from '../../modals/product/modal-product.component';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit, OnDestroy {
  id: number;
  private sub: any;
  @ViewChild(IonContent, { static: false }) content: IonContent;

  constructor(private route: ActivatedRoute, private modalCtrl: ModalController, private productsService: ProductsService) {
    this.productsService.activeModalProduct$.subscribe(product => {
      setTimeout(() => this.content.scrollToTop(0).then(), 0)
    });
  }

  ngOnInit() {
    window.analytics.page('product');
    this.sub = this.route.params.subscribe(async params => {
      console.log(params,"params")
      this.id = +params['id']
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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
}
