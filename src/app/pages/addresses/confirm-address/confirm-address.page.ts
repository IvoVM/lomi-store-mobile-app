import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AddressService } from 'src/app/services/address.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { environment } from 'src/environments/environment';

declare const google: any;

@Component({
  selector: 'app-confirm-address',
  templateUrl: './confirm-address.page.html',
  styleUrls: ['./confirm-address.page.scss'],
})
export class ConfirmAddressPage implements OnInit {

  invalidAddress = false
  addressForm: FormGroup
  oldAddress
  address
  coordinates
  map: any;
  @ViewChild('mapElement') mapElement: any

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    public formBuilder: FormBuilder,
    private userEventsService: UserEventsService,
    private addressService: AddressService
  ) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const { address, coordinates, oldAddress} = this.router.getCurrentNavigation().extras.state;
        this.address = address;
        this.coordinates = coordinates;
        this.oldAddress = oldAddress
      }
    });
  }

  ngOnInit() {
    this.addressForm = this.formBuilder.group({
      address2: [''],
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      phone: ['', [Validators.required]],
    });
    if (this.oldAddress) {
      const { attributes } = this.oldAddress
      this.addressForm.controls['address2'].setValue(attributes.address2 ?? '')
      this.addressForm.controls['firstname'].setValue(attributes.firstname)
      this.addressForm.controls['lastname'].setValue(attributes.lastname)
    }
  }

  ionViewWillEnter() {
    this.createMap()
  }
  async createMap() {
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      mapId: '43fdde59790d61f6',
      center: {
        lat: this.coordinates.lat,
        lng: this.coordinates.lng,
      },
      zoom: 16
    })

    this.addMarket()

    if (!this.address.address1) {
      this.invalidAddress = true
    } 
  }

  async addMarket() {
    const marker = 
      {
        iconUrl: '../../../../assets/icons/google_marker.svg',
        coordinate: {
          lat: this.coordinates.lat,
          lng: this.coordinates.lng,
        },
      }
    new google.maps.Marker({
      position: marker.coordinate,
      icon: marker.iconUrl,
      map: this.map    
    });
  }

  async goBack() {
    await this.navCtrl.back();
  }


  create() {
    this.userEventsService.userEvents['location_address.saved'].track();
    if (!this.addressForm.valid) {
      return 
    } else {
      let addressData = {
        address1: `${this.address.address1}  ${this.address.address2}`,
        country_id: this.address.country[0].id,
        state_id: this.address.state[0].id,
        county_id: this.address.county[0].id,
        ...this.addressForm.value,
        city: this.address.county[0].name
      }
      this.addressService.createAddress(addressData, this.oldAddress.id ?? null).then(async resp => {
        if (resp.isFail()) {
        } else {
          this.router.navigateByUrl('/addresses')
        }
      });
    }
  }

}
