import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { AddressService } from 'src/app/services/address.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { Utils } from 'src/utils/util';

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss'],
})
export class AddressFormComponent implements OnInit {
  address;
  titlePage = '';
  visibleIcon = false;
  submitted = false;
  addressForm: FormGroup
  countries = [];
  counties = [];
  states = [];
  fromModal = false;
  stateToCity = {}

  constructor(
    private navCtrl: NavController,
    public formBuilder: FormBuilder,
    private addressService: AddressService,
    private userEventsService: UserEventsService
    ) { }

  get filteredStates(){
    if(this.addressForm.controls.country_id.value){
      let avaibleStates = this.countries.find((country)=>{
        return country.id == this.addressForm.controls.country_id.value
      }).relationships.states.data.map((state)=>{
        return state.id
      })

      return this.states.filter((state)=>{
        return avaibleStates.includes(state.id)
      })
    }
    return null
  }

  get filteredCounties(){
    return this.counties.filter((countie)=>{
      return countie.state_id == this.addressForm.controls.state_id.value
    })
  }

  ngOnInit() {
    this.addressForm = this.formBuilder.group({
      address1: ['', [Validators.required]],
      address2: [''],
      country_id: ['', [Validators.required]],
      state_id: ['', [Validators.required]],
      county_id: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      city: ['', [Validators.required]]
    });

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


  create() {
    this.userEventsService.userEvents['location_address.saved'].track();
    if (!this.addressForm.valid) {
      this.submitted = true;
    } else {
      const id = this.address ? this.address.id : null;
      this.addressService.createAddress(this.addressForm.value, id).then(async resp => {
        if (resp.isFail()) {
        } else {
          this.navCtrl.back();
        }
      });
    }
  }
}
