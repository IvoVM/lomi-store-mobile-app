import { Component, Input, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CartService } from 'src/app/services/cart.service';
import { ModalsService } from 'src/app/services/modals.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Component({
  selector: 'app-lomibox-modal',
  templateUrl: './lomibox-modal.component.html',
  styleUrls: ['./lomibox-modal.component.scss'],
})
export class LomiboxModalComponent implements OnInit {

  @Input() box
  @Input() boxPrice
  @Input() products
  
  constructor(
    private modalService: ModalsService,
    private navCtrl: NavController,
    private cartService: CartService,
    private userEventsService: UserEventsService,
  ) { }

  ngOnInit() {
    this.userEventsService.userEvents['lomi_box_modal.loaded'].track()
  }

  openProduct(product) {
    this.modalService.dismissTopModal()
    this.modalService.openProduct(product)
  }

  closeModal() {
    this.modalService.dismissTopModal()
  }

  async addAllProducts() {
    this.userEventsService.userEvents['openBoxModal.added'].track({
      mix: this.box
    })
    this.modalService.dismissTopModal()
    this.modalService.openProcesingData({ title: 'Estamos agregando los productos al carrito...' })
    let count = 0;
    this.products.forEach(async (element) => {
      await this.cartService.addItem(element.variants[0], 1, element.variants[0].attributes.options_text, true)
      count ++
      if (this.products.length == count) {
        this.modalService.dismissTopModal()
        this.modalService.openStockRepeatOrder()
        this.modalService.dismissTopModal()
      }
    })
  }
}
