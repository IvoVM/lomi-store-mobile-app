import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-modal-faqs',
  templateUrl: './modal-faqs.component.html',
  styleUrls: ['./modal-faqs.component.scss'],
})
export class ModalFaqsComponent implements OnInit {
  faqs;

  constructor(private modalCtrl: ModalController,
              private http: HttpClient) {
  }

  ngOnInit() {
    const url = environment.host + '/api/v1/faqs';
    return this.http.get(url).subscribe((resp: any) => {
      this.faqs = resp.faqs;
    });
  }

  async dismiss() {
    await this.modalCtrl.dismiss();
  }

}
