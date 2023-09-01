import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSyncroService } from './firebase/providers/user-syncro';

@NgModule({
    declarations: [
    ],
    exports: [
    
    ],
    providers: [
        UserSyncroService
    ]
})
export class NewSharedModule { }
