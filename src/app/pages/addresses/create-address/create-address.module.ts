import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateAddressPageRoutingModule } from './create-address-routing.module';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";

import { CreateAddressPage } from './create-address.page';
import { AddressFormComponent } from './address-form/address-form.component';
import { GooglePlaceComponent } from './google-place/google-place.component';

@NgModule({
  imports: [
    CommonModule,
    GooglePlaceModule,
    FormsModule,
    IonicModule,
    CreateAddressPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [CreateAddressPage, AddressFormComponent, GooglePlaceComponent],
})
export class CreateAddressPageModule {}
