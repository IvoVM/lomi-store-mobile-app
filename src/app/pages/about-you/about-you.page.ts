import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { PopoverComponent } from 'src/app/about-you-head/popover/popover.component';
import { AddressService } from 'src/app/services/address.service';
import { ModalsService } from 'src/app/services/modals.service';
import { SecurityProvider } from 'src/app/services/security.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Component({
  selector: 'app-about-you',
  templateUrl: './about-you.page.html',
  styleUrls: ['./about-you.page.scss'],
})
export class AboutYouPage implements OnInit {

  personalInfoForm: FormGroup
  cities = [];
  date = '';
  newUser = false
  county;
  storageCounty;

  constructor(
    private router: Router,
    private addressService: AddressService,
    public formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private securityProvider: SecurityProvider,
    private popoverController: PopoverController,
    private modalsService: ModalsService,
    private toastCtrl: ToastController,
    private storage: Storage,
    private userEventsService: UserEventsService,

  ) { 
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const { newUser } = this.router.getCurrentNavigation().extras.state;
        this.newUser = newUser;
      }
    });
  }

  ngOnInit() {
    window.analytics.page('about_you');
    this.userEventsService.userEvents['about_you.loaded'].track();
    this.personalInfoForm = this.formBuilder.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      born_date: ['', [Validators.pattern("^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.]((18|19|20|21)\\d\\d)$")]],      county_id: ['', [Validators.required]],
      gender: ['', []],
    })
    this.getCountyFromStorage()
  }

  goBack() {
    this.userEventsService.userEvents['back_button.clicked'].track()
    this.router.navigate(['/tabs/home'])
  }

  create() {
    this.userEventsService.userEvents['create.clicked'].track({
      data: this.personalInfoForm.value
    })
    this.personalInfoForm.value.county_id = this.county.id
    if (!this.personalInfoForm.valid) return false
    this.securityProvider.updateDataAccount(this.personalInfoForm.value).then(resp => {
      if (resp.isSuccess()) {
        this.securityProvider.setUserData(resp.success())
        if (!this.newUser) {
          return this.router.navigate(['/tabs/home'])
        }
        return this.router.navigate(['/registration/registration-complete'])
      } else {
        this.showToast(resp.fail().summary)
      }
    });

  }

formatDate(event): string {
  let { data } = event.detail
    this.date += data
    if (data === null) {
      this.date = this.date.substring(0, this.date.length -5)
    } else  if (this.date.length === 2) {
      this.date += '/'
    } else if (this.date.length === 5) {
      this.date += '/'
    }
    return this.date
  }

  async showPopover(ev: any) {
    console.log(ev)
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      cssClass: 'about-you-popover',
      event: ev,
      translucent: false
    });
    await popover.present();
  
    const { role } = await popover.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  async getCountyFromStorage() {
    this.storageCounty = await this.storage.get('county_id')
  }


  async selectCounty(){
    const modal:any = await this.modalsService.openSelectorCountyModal();
    modal.onDidDismiss().then((res)=>{
      this.county = res.data 
      console.log('#', this.county)
      this.filterCounty()
    })
  }

  async filterCounty() {
    let counties =  await this.addressService.getCounties().toPromise();
    let idToFiler = this.county ? this.county.id: this.storageCounty
    console.log(idToFiler)
    let county = counties['counties'].filter(c => c.id == idToFiler)
    this.county = county[0]
  }

  async showToast(message, color = 'danger') {
    await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      cssClass: 'toast-error',
      color: color, //danger
      buttons: [{
        text: 'OK',
        handler: () => {
          console.log("ok clicked");
        }
      }]
    }).then(res => res.present());
  }

}
