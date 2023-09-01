import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TaxonsServices } from '../../../services/taxons.services';
import { Router } from '@angular/router';
import { Utils } from '../../../../utils/util';

@Component({
  selector: 'app-categories',
  templateUrl: 'categories.page.html',
  styleUrls: ['categories.page.scss']
})
export class CategoriesPage {
  items: any = [];

  constructor(private taxonsServices: TaxonsServices, private router: Router) {
    this.getTaxons()
  }

  expandItem(item): void {
    if (item.expanded) {
      item.expanded = false;
    } else {
      this.items.map(listItem => {
        if (item == listItem) {
          listItem.expanded = !listItem.expanded;
        } else {
          listItem.expanded = false;
        }
        return listItem;
      });
    }
  }

  getTaxons() {
    this.taxonsServices.getTaxons({
      filter: {
        parent_id: '9',
      },
      include: 'children',
      per_page: 100,
    }).then(resp => {
      this.parseTaxons(resp.data, resp.included);
    })
  }

  parseTaxons(taxons, included) {
    const tax1 = taxons.filter(t => +t.attributes.depth === 1);
    const tax2 = included;
    tax1.forEach(t1 => {
      t1.subcategories = Utils.sortByAlphabet(tax2.filter(t2 => +t2.relationships.parent.data.id === +t1.id));
    });
    this.items = Utils.sortByAlphabet(tax1);
  }

  hasChildren(item) {
    return item.relationships.children.data.length
  }

  goToTaxon(item) {
    if (!this.hasChildren(item)) {
      this.router.navigate(['taxon', item.id]);
    }
  }
}
