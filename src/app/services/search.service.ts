import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  
  products$ = new BehaviorSubject([]);
  
  private _searchBarOpened = false;
  private _currentSearching = "";
  public searchBarOpened$ = new BehaviorSubject(false);
  public currentSearch$ = new BehaviorSubject("");

  constructor() {
    this.searchBarOpened$.subscribe((state)=>{
      this._searchBarOpened = state;
    })
  }

  get currentSearch(){
    return this._currentSearching;
  }

  editSearch(value){
    this._currentSearching = value;
    this.currentSearch$.next(value);
  }

  toggleSearchBar(state){
    this.searchBarOpened$.next(state);
  }

  searchProducts$(products) {
    this.products$.next(products);
  }
}
