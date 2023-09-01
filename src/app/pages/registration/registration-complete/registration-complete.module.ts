import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistrationCompletePageRoutingModule } from './registration-complete-routing.module';

import { RegistrationCompletePage } from './registration-complete.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistrationCompletePageRoutingModule
  ],
  declarations: [RegistrationCompletePage]
})
export class RegistrationCompletePageModule {}
