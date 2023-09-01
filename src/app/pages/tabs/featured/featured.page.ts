import { Component, OnInit } from '@angular/core';
import { TaxonsServices } from '../../../services/taxons.services';

@Component({
  selector: 'app-featured',
  templateUrl: 'featured.page.html',
  styleUrls: ['featured.page.scss']
})
export class FeaturedPage implements OnInit {
  public taxons;

  constructor(public taxonsService: TaxonsServices) {
  }

  ngOnInit() {
  }
  
  ionViewDidEnter() {
    this.getTaxons();
  }

  getTaxons() {
    this.taxonsService.getTaxon(1594).then(resp => {
      this.taxons = resp.included.concat(resp.data)
      this.taxons = this.taxons.map(t => t).sort((a, b) => {
        if (a.id == 1981) return -1
      })
    });
  }
}
