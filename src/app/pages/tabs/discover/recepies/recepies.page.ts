import { Component, OnInit } from '@angular/core';
import { ModalsService } from 'src/app/services/modals.service';
import { RecepiesService } from 'src/app/services/recepies.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Component({
  selector: 'app-recepies',
  templateUrl: './recepies.page.html',
  styleUrls: ['./recepies.page.scss'],
})
export class RecepiesPage implements OnInit {
  
  filterValue = ''
  recepiesHeader: any = []
  recepies: any = []
  selectedTab = 'todos'
  constructor(
    private recepiesService: RecepiesService,
    private modalService: ModalsService,
    private userEventsService: UserEventsService,
  ) { }

  ngOnInit() {
    this.userEventsService.userEvents['recipe_screen.loaded'].track()
    this.recepiesService.recepies$.subscribe(resp => {
      this.recepies = resp
      this.recepiesHeader = resp
    })
  }

  pickRandomRecepy() {
    this.userEventsService.userEvents['pickRandomRecepy.clicked'].track()
    let randomIndex = Math.floor(Math.random() * this.recepies.length)
    this.openRecepyModal(this.recepies[randomIndex])
  }

  selectTab(tab: string) {
    this.selectedTab = tab
    // if (tab != 'todos') {
    //   this.recepiesService.getRecipeByCategory(tab).subscribe(resp => {
    //     this.recepies = resp
    //   })
    // }
    // this.recepiesService.getRecepies()
  }

  async openRecepyModal(recepy: any): Promise<any> {
    this.userEventsService.userEvents['openRecipe.clicked'].track({
      recipe: recepy
    })
    await this.modalService.openLomiRecepyModal({ recepyId: recepy.id })
  }

  filterItems(event) {
    return this.filterValue = event.detail.value
  }

}
