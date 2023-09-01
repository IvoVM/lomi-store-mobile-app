import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-modal-terms',
  templateUrl: './modal-terms.component.html',
  styleUrls: ['./modal-terms.component.scss'],
})
export class ModalTermsComponent implements OnInit {
  terms;
  constructor(private modalCtrl: ModalController,
              private http: HttpClient) {
  }

  ngOnInit() {
    const url = environment.host + '/api/v1/terms_and_conditions';
    return this.http.get(url).subscribe((resp: any) => {
      this.terms = resp.terms_and_conditions;
    });
  }

  async dismiss() {
    await this.modalCtrl.dismiss();
  }

}
