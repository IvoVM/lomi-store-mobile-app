import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AboutYouPageRoutingModule } from './about-you-routing.module';

import { AboutYouPage } from './about-you.page';
import { SharedModules } from 'src/app/modules/shared.modules';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AboutYouPageRoutingModule,
    ReactiveFormsModule,
    SharedModules
  ],
  declarations: [AboutYouPage]
})
export class AboutYouPageModule {}
