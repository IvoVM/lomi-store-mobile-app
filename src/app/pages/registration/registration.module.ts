import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistrationPageRoutingModule } from './registration-routing.module';

import { RegistrationPage } from './registration.page';
import { SharedModules } from 'src/app/modules/shared.modules';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistrationPageRoutingModule,
    ReactiveFormsModule,
    SharedModules,
  ],
  declarations: [RegistrationPage]
})
export class RegistrationPageModule {}
