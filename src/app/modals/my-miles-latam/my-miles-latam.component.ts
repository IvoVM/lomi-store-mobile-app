import { Component, OnInit } from '@angular/core';
import { SecurityProvider } from 'src/app/services/security.service';

@Component({
  selector: 'app-my-miles-latam',
  templateUrl: './my-miles-latam.component.html',
  styleUrls: ['./my-miles-latam.component.scss'],
})
export class MyMilesLatamComponent implements OnInit {

  accumulatedLatamMiles = 1

  constructor(
    private securityService: SecurityProvider
  ) { }

  ngOnInit() {
    this.securityService.getUserDataFromEP().then(resp => {
      if (resp.attributes) this.accumulatedLatamMiles = resp.attributes.accumulated_latam_miles
    })
  }

}
