import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Utils } from '../../../../../utils/util';
import { environment } from '../../../../../environments/environment';
import { IonSlides } from '@ionic/angular/directives/proxies';

@Component({
  selector: 'app-main-slides',
  templateUrl: './product-detail-slides.component.html',
  styleUrls: ['./product-detail-slides.component.scss'],
})
export class ProductDetailSlidesComponent implements OnInit {
  @Input() product;
  @Input() imagesIds;
  public images = [];
  public host = environment.host;
  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    speed: 800,
  };
  @ViewChild('mySlider') slides: IonSlides;

  constructor() {
  }

  reducedSize(img){
    return img.replace("https://cdn2.lomi.cl/","https://cdn2.lomi.cl/cdn-cgi/image/width=600,height=600,f=auto,fit=pad/")
  }


  ngOnInit() {
    this.imagesIds.subscribe(ids => {
      this.toSlides(this.product, ids);
      setTimeout(() => this.slides.update().then(), 300)
    });
  }

  toSlides(product, ids) {
    this.images = Utils.getImgBySize(product) ? Utils.getImgBySize(product, true, ids) : [];
  }

}
