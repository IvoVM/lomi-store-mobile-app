import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { PopoverComponent } from './popover/popover.component';

@Component({
  selector: 'app-about-you-head',
  templateUrl: './about-you-head.component.html',
  styleUrls: ['./about-you-head.component.scss'],
})
export class AboutYouHeadComponent implements OnInit {

  constructor(
    private router: Router,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {}

  goBack() {
    this.router.navigate(['/tabs/home'])
  }

  async showPopover(ev: any) {
    console.log(ev)
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      cssClass: 'about-you-popover',
      event: ev,
      translucent: false
    });
    await popover.present();
  
    const { role } = await popover.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }
}
