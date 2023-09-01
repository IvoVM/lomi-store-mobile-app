import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-modal-shipment-avaibility',
  templateUrl: './modal-shipment-avaibility.component.html',
  styleUrls: ['./modal-shipment-avaibility.component.scss'],
})
export class ModalShipmentAvaibilityComponent implements OnInit {
  counties = [];

  constructor(private modalCtrl: ModalController,
              private http: HttpClient) {
  }

  ngOnInit() {
    const url = environment.host + 'api/v1/counties';
    return this.http.get(url).subscribe((resp: any) => {
      console.log(resp)
      this.counties = resp.counties;
    });
  }

  async dismiss() {
    await this.modalCtrl.dismiss();
  }

}
