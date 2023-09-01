import { Component, Input, OnInit } from '@angular/core';
import { ModalsService } from 'src/app/services/modals.service';
import { RecepiesService } from 'src/app/services/recepies.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Component({
  selector: 'app-lomi-mix-categories',
  templateUrl: './lomi-mix-categories.component.html',
  styleUrls: ['./lomi-mix-categories.component.scss'],
})
export class LomiMixCategoriesComponent implements OnInit {

  categoryBox: any = []
  @Input() titleLink = true

  constructor(
    private recepiesService: RecepiesService,
    private userEventsService: UserEventsService,
    private modalService: ModalsService
  ) { }

  ngOnInit() {
    this.recepiesService.getCategoryBox()
    this.recepiesService.categoryBox$.subscribe(resp => {
      this.categoryBox = resp
    })
  }

  goToCategory(tab: string, img: string): void {
    this.userEventsService.userEvents['goToCategory.clicked'].track()
    this.modalService.openLomiBoxCategoryModal({selectedTab: tab, bgImg: img})
  }

}
