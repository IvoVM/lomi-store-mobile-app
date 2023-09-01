import { Component, Input, OnInit } from '@angular/core';
import { ModalsService } from 'src/app/services/modals.service';
import { RecepiesService } from 'src/app/services/recepies.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Component({
  selector: 'app-lomi-favorites-recipes',
  templateUrl: './lomi-favorites-recipes.component.html',
  styleUrls: ['./lomi-favorites-recipes.component.scss'],
})
export class LomiFavoritesRecipesComponent implements OnInit {

  recepiesHeader: any = []
  recepies: any = []
  @Input() title = ''
  @Input() titleLink = true
  constructor(
    private recepiesService: RecepiesService,
    private userEventsService: UserEventsService,
    private modalService: ModalsService
  ) { }

  ngOnInit() {
    this.recepiesService.getFavoritesRecipes()
    this.recepiesService.favoriteRecipes$.subscribe(resp => {
      this.recepies = resp
      this.recepiesHeader = resp
    })
  }

  async openRecepyModal(recepy: any): Promise<any> {
    this.userEventsService.userEvents['openRecipe.clicked'].track({
      recipe: recepy
    })
    await this.modalService.openLomiRecepyModal({ recepyId: recepy.id })
  }


}
