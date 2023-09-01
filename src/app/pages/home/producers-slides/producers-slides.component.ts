import { Component, OnInit } from '@angular/core';
import { ProducersService } from '../../../services/producers.service';

@Component({
  selector: 'app-producers-slides',
  templateUrl: './producers-slides.component.html',
  styleUrls: ['./producers-slides.component.scss'],
})
export class ProducersSlidesComponent implements OnInit {

    get slideOpts(){
      return {
        initialSlide: 0,
        slidesPerView: 3.3,
        speed: 800,
        spaceBetween: 0,
        watchSlidesProgress: true,
        pager: false
      }
    }

  producers;

  constructor(private producersService: ProducersService) {
  }

  ngOnInit() {
    this.producersService.getProducers().subscribe((resp: any) => {
      this.producers = resp.producers;
    })
  }

}
