import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LomiboxPageRoutingModule } from './lomibox-routing.module';

import { LomiboxPage } from './lomibox.page';
import { SharedModules } from 'src/app/modules/shared.modules';
import { SearchBoxPipe } from 'src/app/pipes/search-box.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LomiboxPageRoutingModule,
    SharedModules,
  ],
  declarations: [LomiboxPage, SearchBoxPipe ]
})
export class LomiboxPageModule {}
