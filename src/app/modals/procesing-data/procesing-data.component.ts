import { Component, Input, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-procesing-data',
  templateUrl: './procesing-data.component.html',
  styleUrls: ['./procesing-data.component.scss'],
})
export class ProcesingDataComponent implements OnInit {

  @Input() title: string;º
  @Input() subTitle: string;
  options: AnimationOptions = {
    path: '../../../assets/json/ezgif.com-gif-maker.mp4.lottie.json',
  };

  constructor() { }

  ngOnInit() { }

}
