import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
})
export class SplashScreenComponent implements OnInit {

  lomiBackground = true;
  lomiVeggetables = true;
  lomiTittle = true;
  lomiBag = true;

  appendAt(seconds, animation){
    setTimeout(()=>{
      this[animation] = true;
    },seconds*1000)

  }

  constructor() {
  }

  ngOnInit() {}

}
