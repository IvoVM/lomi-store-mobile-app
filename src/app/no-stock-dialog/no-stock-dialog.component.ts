import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-no-stock-dialog',
  templateUrl: './no-stock-dialog.component.html',
  styleUrls: ['./no-stock-dialog.component.scss'],
})
export class NoStockDialogComponent implements OnInit {

  constructor(private modalCtrl:ModalController) { }

  confirm(){
    this.modalCtrl.dismiss()
  }

  ngOnInit() {}

}
