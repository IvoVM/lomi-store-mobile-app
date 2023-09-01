import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-checkout-note',
  templateUrl: './checkout-note.component.html',
  styleUrls: ['./checkout-note.component.scss'],
})
export class CheckoutNoteComponent implements OnInit {

  @Input() nota = ''

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    console.log(this.nota)
  }

  dismiss() {
    this.modalCtrl.dismiss(this.nota)
  }

  setInstructions(event) {
    this.nota = event.detail.value;
  }


}
