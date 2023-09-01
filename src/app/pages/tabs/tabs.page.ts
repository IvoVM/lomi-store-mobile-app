import { Component, OnInit, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ModalAccountComponent } from 'src/app/modals/account/modal-account.component';
import { IonTabs, ModalController, NavController } from '@ionic/angular';
import { SecurityProvider } from 'src/app/services/security.service';
import { Router } from '@angular/router';
import { ModalLoginComponent } from 'src/app/modals/login/modal-login.component';
import { LoadingController } from '@ionic/angular';
import { UserEventsService } from 'src/app/user-events/user-events.service';
import { LaunchDarklyService } from 'src/app/services/launch-darkly.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit, OnDestroy{

  public loading:any
  public discoverTab =  false;

  loggedIn = false;;
  @HostListener('scroll', ['$event'])
  @ViewChild('tabs') tabs: IonTabs;
  activeTabName
  onScroll(event: any) {
    console.log(event);
  }

  ngOnDestroy(): void {
  }

  constructor(
    private userEventsService: UserEventsService,
    private ldService: LaunchDarklyService,
    private modalCtrl: ModalController, public securityProvider:SecurityProvider, public router:Router, private loadingCtrl:LoadingController) {
    this.securityProvider.isLoggedIn().subscribe((loggedIn)=>{
      this.loggedIn = loggedIn;
    })
    this.ldService.flags$.subscribe(()=>{
      this.discoverTab = this.ldService.client.variation('discover-tab',false)
    })
  }
  private currentPosition;


  openAccountMenu(){
    if (this.securityProvider.isLoggedIn().getValue()) {
      this.openModalAccount().then()
    } else {
      this.router.navigateByUrl('/login')
    }
  }

  ngOnInit(): void {
    this.discoverTab = this.ldService.client.variation('discover-tab',false)
    let content = document.querySelector('ion-content');
    content.scrollEvents = true;
    const tabsInner:any = document.querySelector('.tabs-inner');
    const tab:any = document.querySelector('ion-tab-bar');
    content.addEventListener('ionScroll', (event:any) => {
      let scroll = event.detail.scrollTop
      /**if (true || event.detail.deltaY < 0 && tab || event.detail.scrollTop < 50) {
        tab.style.transform = '';
        document.querySelector('.flexible-promotions-bar')["style"].transform = '';
        tabsInner.style.contain = 'none';
        tabsInner.style.height = ''
      } else if(tab) {
        tab.style.transform = 'translateY(100px)';
        const promotions = document.querySelector('.flexible-promotions-bar:not(.hide)');
        promotions ? promotions["style"].transform = 'translateY(70px)' : null;
        tabsInner.style.contain = 'none';
        tabsInner.style.height = '100vh'
      }**/
      this.currentPosition = scroll;
    });
  }

  async openModalAccount() {
    const modal = await this.modalCtrl.create({
      component: ModalAccountComponent,
      canDismiss: true,
      cssClass: 'modal-class'
    });

    await modal.present();
  }

  async goToMenu() {
    if (this.securityProvider.isLoggedIn().getValue()) {
      this.userEventsService.userEvents['menu.clicked'].track()
      this.router.navigateByUrl('tabs/menu')
    } else {
      this.userEventsService.userEvents['login_screen.clicked'].track()
      this.router.navigateByUrl('/login')
    }
  }
  
  async openLoginModal(){
    const modal = await this.modalCtrl.create({
      component: ModalLoginComponent,
      canDismiss: true,
      cssClass: 'modal-class'
    });
  
    await modal.present();
  }

  async presentLoading(){
    this.loading = await this.loadingCtrl.create(
      {
        message: "Loading",
      }
    )
    this.loading.present()
  }

  async getCurrentTab() {
    this.activeTabName = this.tabs.getSelected();
  }

  goToTdiscover() {
    this.router.navigate(['/tabs/discover'])
  }

  salesClicked() {
    this.userEventsService.userEvents['promotion.clicked'].track()
  }
}
