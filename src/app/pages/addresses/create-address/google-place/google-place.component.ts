import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {  NavigationExtras, Router } from '@angular/router';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { AddressService } from 'src/app/services/address.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { Utils } from 'src/utils/util';

@Component({
  selector: 'app-google-place',
  templateUrl: './google-place.component.html',
  styleUrls: ['./google-place.component.scss'],
})
export class GooglePlaceComponent implements OnInit {
  @Input() oldAddress
  initialValue = ''
  address;
  countries = [];
  counties = [];
  states = [];
  fromModal = false;
  errorPLaces = {
    country: false,
    state: false,
    countie: false
  }
  coordinates: any
  stateToCity = {}
  @ViewChild("placesRef") placesRef : GooglePlaceDirective;
  options: any ={
    types: []
    }
  constructor(
    private router: Router,
    private addressService: AddressService,
    private userEventsService: UserEventsService,
    ) {
  }

  handleAddressChange(address: Address) {
    let address1 = address.address_components.filter(p => p.types[0] === 'route')
    let address2 = address.address_components.filter(p => p.types[0] === 'street_number')
    let country = address.address_components.filter(p => p.types[0] === 'country')
    let state = address.address_components.filter(p => p.types[0] === 'administrative_area_level_1').map(s => s.long_name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase())
    let state2 = address.address_components.filter(p => p.types[0] === 'administrative_area_level_2').map(s => s.long_name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase())
    let comuna = address.address_components.filter(p => p.types[0] === 'administrative_area_level_3')

    let country_id = this.countries.filter(c => c.attributes.name === country[0].long_name)
    let state_id = this.states.filter(s => s.attributes.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().includes(state) || s.attributes.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().includes(state2))
    let county_id = this.counties.filter(c => c.name.toLowerCase().includes(comuna[0].long_name.toLowerCase()))

    
    if (!country_id.length) {
      this.errorPLaces.country = true
      this.errorPLaces.state = false 
      this.errorPLaces.countie = false 
    } else if (!state_id.length) {
      this.errorPLaces.country = false
      this.errorPLaces.state = true 
      this.errorPLaces.countie = false 
    } else if (!county_id.length) {
      this.errorPLaces.country = false
      this.errorPLaces.state = false 
      this.errorPLaces.countie = true 
    } else {
      this.errorPLaces.country = false
      this.errorPLaces.state = false 
      this.errorPLaces.countie = false 
      
      this.address = {
        address1: address1.length ? address1[0].long_name : '',
        address2: address2.length ? address2[0].long_name : '',
        country: country_id.length ? country_id: '',
        state: state_id.length ? state_id: '',
        county: county_id.length ? county_id: '' 
      }
      
      this.coordinates = address.geometry.location.toJSON()

      this.goToConfirmAdrress()
    }
  }


  ngOnInit() {
    if (this.oldAddress) {
      const { attributes } = this.oldAddress
      this.initialValue = `${attributes.address1}, ${attributes.county_name}, ${attributes.country_name}`
    }
    this.addressService.getGlobalAddresses()
    .then(res => res.json().then(json=>{
      for( let address of json.data){
        this.stateToCity[address.attributes.state_id] = address.attributes.city
      }
    }))

    this.addressService.getCounties().subscribe((resp: any) => {
      if (resp.status === 'ok') {
        this.counties.push(...resp.counties);
      }
    });

    this.addressService.getCountries().subscribe((resp: any) => {
      this.countries.push(...resp.data);
      this.states.push(...Utils.getIncluded(resp,'state'));
    });

  }
  
  async goToConfirmAdrress(): Promise<void> {
    if (this.errorPLaces.country || this.errorPLaces.countie || this.errorPLaces.state) {
      return
    }
    let navigationExtras: NavigationExtras = {
      state: {
        address: this.address,
        coordinates: this.coordinates,
        oldAddress: this.oldAddress
      }
    }
    await this.router.navigate(['addresses/confirm-address'], navigationExtras)
  }
}

