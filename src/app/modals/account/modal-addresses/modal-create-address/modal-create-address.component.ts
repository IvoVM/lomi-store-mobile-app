import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { SecurityProvider } from '../../../../services/security.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AddressService } from '../../../../services/address.service';
import { Utils } from '../../../../../utils/util';

@Component({
  selector: 'app-modal-create-address',
  templateUrl: './modal-create-address.component.html',
  styleUrls: ['./modal-create-address.component.scss'],
})
export class ModalCreateAddressComponent implements OnInit {
  @Input() address;
  addressForm: FormGroup;
  submitted = false;
  loginError = false;
  loading = false;
  countries = [];
  counties = [];
  states = [];
  stateToCity = {}

  constructor(private modalCtrl: ModalController,
              private securityProvider: SecurityProvider,
              private alerts: AlertController,
              public formBuilder: FormBuilder,
              private router: Router,
              private addressService: AddressService,
              private security: SecurityProvider,
              private toastCtrl: ToastController) {
  }

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
      return countie.id == this.addressForm.controls.state_id.value
    })
  }

  ngOnInit() {
    this.addressForm = this.formBuilder.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      country_id: ['', [Validators.required]],
      state_id: ['', [Validators.required]],
      city: ['', [Validators.required]],
      county_id: ['', [Validators.required]],
      address1: ['', [Validators.required]],
      address2: ['']
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
        console.log(this.counties)
      }
    });

    this.addressService.getCountries().subscribe((resp: any) => {
      this.countries.push(...resp.data);
      this.states.push(...Utils.getIncluded(resp,'state'));
    });
  }

  create() {
    this.loading = true;
    if (!this.addressForm.valid) {
      this.submitted = true;
      this.loading = false;
    } else {
      const id = this.address ? this.address.id : null;
      this.addressService.createAddress(this.addressForm.value, id).then(async resp => {
        this.loading = false;
        if (resp.isFail()) {
          this.loginError = true;
        } else {
          await this.dismiss();
          await this.showToast();
        }
      });
    }
  }

  onChange(input){
    if(input == "country"){
      this.addressForm.controls["state_id"].reset()
      this.addressForm.controls["city"].reset()
    }
    else if(input == "state"){
      this.addressForm.controls["city"].reset()
    }
    this.addressForm.controls["county_id"].reset()
  }

  get errorCtr() {
    return this.addressForm.controls;
  }

  async dismiss() {
    await this.modalCtrl.dismiss();
  }

  async showToast() {
    await this.toastCtrl.create({
      message: "Completado con exitoso",
      duration: 2000,
      position: 'bottom',
      color: 'primary',
      buttons: [{
        text: 'OK',
        handler: () => {
          console.log("ok clicked");
        }
      }]
    }).then(res => res.present());
  }
}
