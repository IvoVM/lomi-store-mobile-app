import { Component, Input, OnInit } from '@angular/core';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { Utils } from 'src/utils/util';

@Component({
  selector: 'app-producer-card',
  templateUrl: './producer-card.component.html',
  styleUrls: ['./producer-card.component.scss'],
})
export class ProducerCardComponent implements OnInit {
  @Input() 'imgWidth': number
  @Input() 'producer'
  constructor(
    private userEvents:UserEventsService,
  ) {}

  get img(){
    if(!this.imgWidth) return Utils.resizeCdnImg(this.producer.profile_image,500)
    let img = Utils.resizeCdnImg(this.producer.profile_image,this.imgWidth ? this.imgWidth : window.innerWidth / 3);
    return img
  }

  producerClicked(){
    this.userEvents.userEvents['local_suppliers.clicked'].track()
  }

  ngOnInit() {
  }

}
