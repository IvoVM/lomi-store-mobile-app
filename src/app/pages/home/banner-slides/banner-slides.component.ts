import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TaxonsServices } from 'src/app/services/taxons.services';
import { IonSlides} from '@ionic/angular';
import { NavigationEnd, Router } from '@angular/router';
import { SecurityProvider } from 'src/app/services/security.service';
import { ProductsService } from 'src/app/services/products.service';
import { ModalsService } from 'src/app/services/modals.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AddressService } from 'src/app/services/address.service';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'app-banner-slides',
  templateUrl: './banner-slides.component.html',
  styleUrls: ['./banner-slides.component.scss'],
})
export class BannerSlidesComponent implements OnInit, AfterViewInit {
  promotions = [];
  currenturl = 'tabs/home';
  stockLocationId: number
  timeLeft = []

  public promotionsCarrousel = [[],[],[],[],[]];
  public promotionsImages;
  public slideLoaded: boolean;
  public slideIndex: number;

  constructor(
    private taxonsService:TaxonsServices, 
    private http: HttpClient, 
    private router: Router,
    private productService: ProductsService,
    private modalService: ModalsService,
    private userEventsService: UserEventsService,
    private iab: InAppBrowser,
    private addressService: AddressService,
    private nativeStorage: Storage
    ) {
    this.getCurrentUrl()
    this.addressService.activeAddress$.subscribe(() => {
      this.getBanners()
    })
  }

  public ionSlidesDidLoad(): void {
    this.slideLoaded = true;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    setInterval(() => {
      this.timeLeft.forEach((element, index) => {
        let timeNow = new Date()
        let promotionTime = new Date(element.expire_at)
        let timeDifference = promotionTime.getTime() - timeNow.getTime()
        
        let days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        if (days > 1) return this.timeLeft[index] = { ...element, countdown: `${days} días`}
        let hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
        
        return this.timeLeft[index] = { ...element, countdown: `${hours}:${minutes}:${seconds} `}
      });
    }, 1000)
  }

  async getBanners() {
    const st = await this.nativeStorage.get('stockLocations');
    const url = environment.host + `/api/v2/promotions?stock_locations=${st}`;
    this.http.get(url).subscribe((data: any) => {
      const promotionFilter = [];
      data.promotions?.forEach(promo => {
        if (promo.category_name === 'banner-app') {
          promo.img = promo.img.replace(",fit=pad", "")
          promotionFilter.push(promo);
        }
      });
      this.promotions = promotionFilter.map((promo)=>{
        promo.code = promo.code ? promo.code : "10000000000"
        return promo
      }).sort((promo1,promo2)=>{
        return promo1.code - promo2.code
      })
      this.promotionsCarrousel = [...this.promotions]
      this.promotionsCarrousel.forEach((promotion: any, index: number) => {
        if (promotion.expires_at) {
          this.timeLeft[index] = { expire_at: promotion.expires_at, promotion_index: index }
        }
      })
    });
  }

  async goToPage(promotionPath) {
   this.userEventsService.userEvents['banner.clicked'].track({
      promotionPath: promotionPath
    })
    try {
      if (promotionPath) {
        if (promotionPath.includes('taxon')) {
          let path = promotionPath.split('/')
          let taxon = await this.taxonsService.getTaxon(path[1]);
          if (!taxon) return 
          await this.router.navigate([`${promotionPath}`], {
            queryParams : {
              taxonName: taxon.data.attributes.name
            }
          })
        } else if (promotionPath.includes('product')) {
          let product = await this.productService.getProductById(promotionPath);      
          this.modalService.openProduct(product, false);
        } else {
          this.iab.create(promotionPath)
        }
      }

    } catch (e) {
      console.log(e)
    }
  
  }

  getCurrentUrl(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currenturl = event['url']
        if (this.currenturl === '/tabs/sales' || this.currenturl === '/tabs/home') {
          this.getBanners()
        }
      }
    })
  }

}
