import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddressService } from '../services/address.service';
import { SecurityProvider } from '../services/security.service';
import { stockLocationByCountyId } from '../county-selector-modal/county_stock-location';

@Component({
  selector: 'app-county-selector-modal',
  templateUrl: './county-selector-modal.component.html',
  styleUrls: ['./county-selector-modal.component.scss'],
})
export class CountySelectorModalComponent implements OnInit {

  public counties = [];
  public filter = ""
  public filteredCounties = []
  private dismissFunc:any;

  constructor(
    private addressService:AddressService,
    public modalCtrl:ModalController,
    private securityService:SecurityProvider,
  ) { }

  async ngOnInit() {
    const countyXHR:any = await this.addressService.getCounties().toPromise();
    this.counties = countyXHR.counties
    this.filteredCounties = this.counties
    const modal = await this.modalCtrl.getTop()
    console.log(this.counties,countyXHR)
  }

  doFilter(HTMLElement){
    console.log(HTMLElement.el.value, this.counties)
    if(HTMLElement.el.value){
      this.filteredCounties = this.counties.filter((county)=>{
        return county.name.toLowerCase().includes(HTMLElement.el.value.toLowerCase())
      })
    }
  }

  selectCounty(county){
    this.securityService.userCounty = county;
    const stockLocation = stockLocationByCountyId.find((sl)=>{
      return sl.county_id == county.id
    })
    this.addressService.getGlobalAddresses().then((globalAddress)=>{
      globalAddress.json().then((addresses)=>{
        const address = addresses.data.find((addr)=>{
          console.log(addr.attributes.address1, stockLocation)
          return addr.attributes.address1 == stockLocation?.store_name
        })
        console.log(stockLocation,address,county,addresses,"ADDRESS")
        this.addressService.setActiveAddress(address, "pickup")
      })
    })
    this.modalCtrl.dismiss(county)
  }

}
