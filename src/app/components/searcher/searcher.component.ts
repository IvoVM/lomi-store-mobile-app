import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { IonSearchbar } from '@ionic/angular';
@Component({
  selector: 'app-searcher',
  templateUrl: './searcher.component.html',
  styleUrls: ['./searcher.component.scss'],
})
export class SearcherComponent implements OnInit {
  @ViewChild(IonSearchbar) q: IonSearchbar;

  public barOpened = false
  @Input() type = "input";


  constructor(public searchService: SearchService) {
    searchService.searchBarOpened$.subscribe((barState) => {
      this.barOpened = barState
      if (barState) {
        setTimeout(() => { this.q?.setFocus(); }, 75);
      }
    })
  }

  onSearch() {
   
  }

  clear(){
    this.q.value = ""
  }

  editSearch(event){
    const searchText = event.detail.value
    this.searchService.editSearch(searchText)
  }

  ngOnInit() { }
  ngOnDestroy(){}

}
