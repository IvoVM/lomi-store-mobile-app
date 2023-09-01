import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ModalMyAccountComponent } from 'src/app/modals/account/my-account/modal-my-account.component';
import { AddressService } from 'src/app/services/address.service';
import { ModalsService } from 'src/app/services/modals.service';
import { SecurityProvider } from 'src/app/services/security.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  
  userEmail = '';
  userDataForm: FormGroup;
  submitted = false;
  date = '';  
  cities = [];
  user;
  userImage;
  county;
  storageCounty;

  constructor(
    private securityProvider: SecurityProvider,
    private navCtrl: NavController,
    public formBuilder: FormBuilder,
    private addressService: AddressService,
    private modalCtrl: ModalController,
    private nativeStorage: Storage,
    private modalsService: ModalsService,
    private userEventsService: UserEventsService,
    private storage: Storage,

  ) { 

  }

  ionViewWillEnter() {
    let { data } = this.securityProvider.getUserData();
    this.user = data.attributes
    this.userEmail = data.attributes.email;
    this.nativeStorage.get('googleImageUrl').then( resp => {
      this.userImage = resp
    })
    this.getCountyFromStorage()
    if (this.user.county_id || this.storageCounty) this.filterCounty();
  }
  
  ngOnInit() {
    window.analytics.page('profile');
    this.userEventsService.userEvents['profile.loaded'].track()
    this.userDataForm = this.formBuilder.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      born_date: ['', [Validators.pattern("^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.]((19|20)\\d\\d)$")]],
      county_id: ['', [Validators.required]],
      gender: ['', []],
    })
  }

  goBack(){
    this.userEventsService.userEvents['back_button.clicked'].track()
    this.navCtrl.navigateRoot('/tabs/menu');
  }

  async getCountyFromStorage() {
    this.storageCounty = await this.storage.get('county_id')
  }

  registerData() {
    this.userEventsService.userEvents['create.clicked'].track({
      data: this.userDataForm.value
    })
    this.userDataForm.value.county_id = this.county.id
    if (!this.userDataForm.valid) return false
    this.securityProvider.updateDataAccount(this.userDataForm.value).then(resp => {
      if (resp.isSuccess()) {
        this.securityProvider.setUserData(resp.success())
        this.getUserData()
      }
    });
  }

  async changePassword() {
    const modal = await this.modalCtrl.create({
      component: ModalMyAccountComponent,
      canDismiss: true,
      cssClass: 'modal-class'
    });

    await modal.present();
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

  getUserData() {
    let { data } = this.securityProvider.getUserData();
    this.user = data.attributes
  }

  async selectCounty(){
    const modal:any = await this.modalsService.openSelectorCountyModal();
    modal.onDidDismiss().then((res)=>{
      this.user.county_id = res.data.id
      this.county = res.data 
      this.filterCounty()
    })
  }

  async filterCounty() {
    let counties =  await this.addressService.getCounties().toPromise();
    let idToFiler = this.user.county_id ? this.user.county_id: this.storageCounty
    let county = counties['counties'].filter(c => c.id == idToFiler)
    this.county = county[0]
  }

}
