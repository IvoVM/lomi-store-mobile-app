import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AddressService } from 'src/app/services/address.service';
import { RecepiesService } from 'src/app/services/recepies.service';

@Component({
  selector: 'app-main-categories-slides',
  templateUrl: './main-categories-slides.component.html',
  styleUrls: ['./main-categories-slides.component.scss'],
})
export class MainCategoriesSlidesComponent implements OnInit {

  categories

  constructor(
    private addressService: AddressService,
    private recipeService: RecepiesService,
    private router: Router
  ) { }

  ngOnInit() {
    this.addressService.activeAddress$.subscribe((address:any) => {
      if (address.attributes?.global) return this.categories = []
      this.recipeService.mainCategories$.subscribe(resp => this.categories = resp.sort((a, b) => a.position - b.position))
    })
  }

  goToPage(category) {
    if (category.redirectTo) return this.router.navigateByUrl(category.redirectTo)
    return     this.router.navigate(['taxon', category.taxonId], {
      queryParams : {
        taxonName : category.name
      }
    })
  }

}
