import { Component, Input, OnInit } from '@angular/core';
import { RecepiesService } from 'src/app/services/recepies.service';
import { ModalsService } from 'src/app/services/modals.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Component({
  selector: 'app-lomibox-category-modal',
  templateUrl: './lomibox-category-modal.component.html',
  styleUrls: ['./lomibox-category-modal.component.scss'],
})
export class LomiboxCategoryModalComponent implements OnInit {

  @Input() selectedTab
  @Input() bgImg
  boxFilter = []
  categoryBox: any = []

  constructor(
    private recipesService: RecepiesService,
    private modalService: ModalsService,
    private recepiesService: RecepiesService,
    private userEventsService: UserEventsService,
  ) { }

  ngOnInit() {
    this.userEventsService.userEvents['lomi_box_category_screen.loaded'].track()
    this.recepiesService.categoryBox$.subscribe(resp => {
      this.categoryBox = resp
    })
    this.getBoxes()
  }
  
  selectTab(tab: string, img) {
    this.selectedTab = tab
    this.bgImg = img
    this.getBoxes()
  }

  getBoxes() {
    this.recipesService.getBoxByCategory(this.selectedTab).subscribe((resp) => {
      this.boxFilter = resp  
    })
  }

  closeModal() {
    this.modalService.dismissTopModal()
  }
}
