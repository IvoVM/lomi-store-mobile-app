import { Injectable } from '@angular/core';
import { SecurityProvider } from './security.service';
import * as ld from 'launchdarkly-js-client-sdk';
import { Subject } from 'rxjs';
import { IPerson } from '../adapters/person.adapter';
import { Platform } from '@ionic/angular';
import { appVersionData } from '../app-version';

@Injectable({
  providedIn: 'root'
})
export class LaunchDarklyService {
  client: ld.LDClient;
  userData: IPerson;
  flagsEvaluated = false;
  flags$: Subject<{}> = new Subject<{}>();

  constructor(
    private securityProvider: SecurityProvider,
    private platform: Platform
    ) {
    this.securityProvider.isLoggedIn$.subscribe((user) => {
      this.userData = this.securityProvider.getUserData();
      this.initService();
    });
  }

  initService() {
    const user: ld.LDUser = {
      key: this.userData ? this.userData.data.id : '',
      email: this.userData ? this.userData.data.attributes.email : '',
      custom: {
        app_version : appVersionData.versionName,
        www_version : appVersionData.wwwVersionName,
        native_version: appVersionData.nativeName,
        native_build: appVersionData.nativeNumber,
        platform: this.platform.is('ios') ? 'ios' : 'android',
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    this.client = ld.initialize('61c0820eb0860914dc7e9da1', user);
    this.client.on('ready', () => {
      const objFlags = {};
      objFlags['chat-customer'] = this.client.variation('chat-customer', false);
      objFlags['discover-tab'] = this.client.variation('discover-tab', false);
      this.flagsEvaluated = true;
      this.flags$.next(objFlags);
    });
  }
}
