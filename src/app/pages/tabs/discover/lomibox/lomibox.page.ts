import { Component, OnInit } from '@angular/core';
import { ModalsService } from 'src/app/services/modals.service';
import { ProductsService } from 'src/app/services/products.service';
import { RecepiesService } from 'src/app/services/recepies.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Component({
  selector: 'app-lomibox',
  templateUrl: './lomibox.page.html',
  styleUrls: ['./lomibox.page.scss'],
})
export class LomiboxPage implements OnInit {

  filterValue;
  lomiBox: any = []
  categoryBox: any = []

  constructor(
    private recepiesService: RecepiesService,
    private userEventsService: UserEventsService,
    ) { }

  ngOnInit() {
    this.userEventsService.userEvents['lomi_box_screen.loaded'].track()
    this.recepiesService.getLomiBox()
    this.recepiesService.lomiBox$.subscribe(resp => {
      this.lomiBox = resp
    })
  }

  filterItems(event) {
    return this.filterValue = event.detail.value
  }

}