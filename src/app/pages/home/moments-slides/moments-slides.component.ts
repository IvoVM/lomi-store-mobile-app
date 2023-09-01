import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SecurityProvider } from 'src/app/services/security.service';
import { TaxonsServices } from 'src/app/services/taxons.services';
import { environment } from '../../../../environments/environment';
import { IonSlides } from '@ionic/angular/directives/proxies';
import { ProductsService } from 'src/app/services/products.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { AddressService } from 'src/app/services/address.service';

@Component({
  selector: 'app-moments-slides',
  templateUrl: './moments-slides.component.html',
  styleUrls: ['./moments-slides.component.scss'],
})
export class MomentsSlidesComponent implements OnInit {

  public moments;
  public momentsCarrousel = [
    [],[],[],[],[],[],[]
  ];
  public momentsImages;
  public slideLoaded: boolean;
  public slideIndex: number;
  public prevIndex = 0;
  public offset = 7;
  public activatedMoment;


  @ViewChild('mySlider') slides: IonSlides;
  @Input() inFlex:boolean = false;

  private addresSubscription;
  public isGlobal = false;

  constructor(
    private userEventsService: UserEventsService,
    private addressService: AddressService,
    private productsService:ProductsService, private router:Router, public taxonsService:TaxonsServices , private http: HttpClient) {
    
    this.addresSubscription = addressService.activeAddress$.subscribe((address:any) => {
      this.isGlobal = address.attributes?.global
    })
    this.getMoments();
  }

  public ionSlidesDidLoad(): void {
    this.slideLoaded = true;
  }

  public categoryStyles(moment,index){
    if(index%2 && moment.id == '1440'){
      return {'background-color': "#FFCB14"}
    }
    return {
      'background-color' : index%2 ? moment.color : 'white'
    }
  }

  goToTaxon(taxonLink) {
    this.userEventsService.userEvents['shop_categories.clicked'].track({
      id: taxonLink.attributes.id,
      name: taxonLink.attributes.name
    })
    console.log(taxonLink,"taxonLink")
    this.router.navigate(['taxon', taxonLink.id], {
      queryParams : {
        taxonName : taxonLink.attributes.name
      }
    }).then();
  }

  ngOnDestroy(): void {
    this.addresSubscription.unsubscribe()
  }

  ngOnInit() {}

  get slideOpts(){
    let size = Math.sqrt(window.innerWidth / 250)
    return {
      initialSlide: 0,
      spaceBetween: 12,
      freeMode: true,
      mousewheel: {
        releaseOnEdges: true,
      },
      slidesPerView: 3 + 0.25,
      speed: 800,
    }
  }

  async getMoments(){
    if(!this.taxonsService.categories){
      await this.taxonsService.fetchCategories()
    }
    let moments = this.taxonsService.categories
    this.moments = moments
    this.momentsCarrousel = [...moments .slice(0,this.offset)]
    this.momentsImages = moments.included
    this.userEventsService.userEvents['shop_categories.loaded'].track()
  }

  
  
}
