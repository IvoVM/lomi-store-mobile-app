import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  submitted = false;

  constructor(private navCtrl:NavController) {
  }

  goBack(){
    this.navCtrl.navigateRoot('/tabs/home')
  }

  ngOnInit() {
    window.analytics.page('login');
  }
}
