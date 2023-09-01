import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration-complete',
  templateUrl: './registration-complete.page.html',
  styleUrls: ['./registration-complete.page.scss'],
})
export class RegistrationCompletePage implements OnInit {

  constructor(
    private router: Router
  ) { 
    setTimeout(() => {
      this.goHome()
    }, 5000);
  }

  ngOnInit() {

  }

  goHome() {
    this.router.navigate(['/tabs/home'])
  }

}
