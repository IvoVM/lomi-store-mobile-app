import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ModalsService } from 'src/app/services/modals.service';
import { SecurityProvider } from 'src/app/services/security.service';
import { TaxonsServices } from 'src/app/services/taxons.services';
import { UserEventsService } from 'src/app/user-events/user-events.service';
@Component({
  selector: 'app-title-link',
  templateUrl: './title-link.component.html',
  styleUrls: ['./title-link.component.scss'],
})
export class TitleLinkComponent implements OnInit {
  @Input() 'link': any;
  @Input() 'title': string;
  @Input() 'taxonId': string;
  @Input() 'noLink': boolean;

  constructor(
    private userEventsService: UserEventsService,
    private modals: ModalsService, private taxonsService: TaxonsServices, private modalCtrl: ModalController, private router: Router, private taxonService: TaxonsServices, private security:SecurityProvider) {
  }

  async ngOnInit() {
    if (this.taxonId) {
      let taxon = await this.taxonService.getTaxon(this.taxonId);
      if(!taxon){
        this.modals.throwUnexpectedError()
        return
      }
      taxon = taxon.data
      this.title = taxon.attributes.name
      this.link = "/taxon/" + this.taxonId
    }
  }

  async goToLink() {
    if(this.noLink)return;
    this.userEventsService.userEvents['swimline_expand.clicked'].track({
      taxon: this.taxonId,
      link: this.link
    })
    if (await this.modalCtrl.getTop()) {
      this.modalCtrl.dismiss()
    }
    if (!this.link) return;
    if (this.link.includes('lomibox') || this.link.includes('recepies')) {
      console.log('#####')
      this.router.navigate([this.link])
    } else {
      this.router.navigate([this.link], {
        queryParams : {
          taxonName : this.title
        }
      }).then();
    }
  }
}
