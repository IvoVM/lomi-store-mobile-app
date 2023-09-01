import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-recover-password-message',
  templateUrl: './recover-password-message.component.html',
  styleUrls: ['./recover-password-message.component.scss'],
})
export class RecoverPasswordMessageComponent implements OnInit {

  constructor(
    private modalCtrl: ModalController,
    private router: Router
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.modalCtrl.dismiss();
      this.router.navigate(['/login'])
    }, 2500);
  }

  confirm(){
    this.modalCtrl.dismiss(true)
  }
  cancel(){
    this.modalCtrl.dismiss(false)
  }

}
