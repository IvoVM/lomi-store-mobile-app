import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TaxonPageRoutingModule } from './taxon-routing.module';

import { SharedModules } from '../../modules/shared.modules';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TaxonPageRoutingModule,
    SharedModules
  ],
  declarations: []
})
export class TaxonPageModule {}
