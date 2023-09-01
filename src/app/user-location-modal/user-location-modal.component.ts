import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { stockLocationByCountyId } from '../county-selector-modal/county_stock-location';
import { AddressService } from '../services/address.service';
import { ModalsService } from '../services/modals.service';
import { SecurityProvider } from '../services/security.service';
@Component({
  selector: 'app-user-location-modal',
  templateUrl: './user-location-modal.component.html',
  styleUrls: ['./user-location-modal.component.scss'],
})
export class UserLocationModalComponent implements OnInit {
  county = "";

  isloggedIn = false

  constructor(
    private modalsService:ModalsService,
    private router:Router,
    private addressService:AddressService,
    private storage: Storage,
    public securityService: SecurityProvider,
  ) {
    this.isloggedIn = securityService.isLoggedIn().getValue()
  }

  async selectCounty(){
    const modal:any = await this.modalsService.openSelectorCountyModal();
    modal.onDidDismiss().then((res)=>{
      this.county = res.data.name;
      const stockLocation = stockLocationByCountyId.find((sl)=>{
        return sl.county_id == res.data.id
      })
      const state = this.addressService.getGlobalAddresses().then((states)=>{
        states.json().then((json)=>{
          const address = json.data.find((address)=>{
            return address.attributes.address1 == stockLocation?.store_name
          })
          this.storage.set('county_id', res.data.id);
          this.storage.set('prefered_address',address)
          try{
            this.securityService.updateDataAccount({
              county_id : res.data.id
            })
          } catch (e){
          }
        })
      });
    })
  }

  exit(){
    this.modalsService.dismissTopModal();
  }

  login(){
    this.router.navigateByUrl("/login")
    this.exit()
  }

  ngOnInit() {}

}
