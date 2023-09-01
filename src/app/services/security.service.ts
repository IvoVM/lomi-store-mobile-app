import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { IPerson } from '../adapters/person.adapter';
import { makeClient } from '@spree/storefront-api-v2-sdk';
import { Storage } from '@ionic/storage';
import { IOAuthToken, IOAuthTokenResult } from '@spree/storefront-api-v2-sdk/types/interfaces/Token';
import { environment } from '../../environments/environment';
import * as Sentry from "@sentry/angular";
import { ModalsService } from './modals.service';
import { AvocadoSorryModalComponent } from '../avocado-sorry-modal/avocado-sorry-modal.component';
import { Router } from '@angular/router';
import { testUsers } from '../components/login/test-user';
@Injectable()
export class SecurityProvider {
  public sessionRestored: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public sessionValidated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loggedIn: Subject<void> = new Subject<void>();
  public sessionReady$: Subject<boolean> = new Subject<boolean>();
  public tokenUpdated: Subject<void> = new Subject<void>();
  private expiresAt = null;
  private accessToken = null;
  private refreshToken = null;
  private userData: IPerson;
  private refreshing = false;
  private client: any;
  public isLoggedIn$ = new BehaviorSubject<any>(null);
  public cardSubscription;

  //User Data <-- Temp -->

  public userCounty;

  constructor(private http: HttpClient,
              private modalsCtrl: ModalController,
              private router: Router,
              private nativeStorage: Storage) {
                
  }

  get tokenExpired(){
    return this.expiresAt ? this.expiresAt*1000 - 60*1000*2 < new Date().getTime() : false
  }

  initSession() {
    this.initClient();
    this.nativeStorage.create().then(() => {
      this.checkStoredSession();
    });
  }

  checkStoredSession() {
    Promise.all([
      this.nativeStorage.get('accessToken'),
      this.nativeStorage.get('refreshToken'),
      this.nativeStorage.get('expiresAt'),
      this.nativeStorage.get('userData'),
    ]).catch(() => {
      this.sessionRestored.next(true);
      
    }).then(async (results: any) => {

      if (results.some(el => !!el)) {
        this.accessToken = results[0];
        this.refreshToken = results[1];
        this.expiresAt = results[2];
        this.userData = JSON.parse(results[3]);
        this.isLoggedIn$.next(this.isStoredSessionValid());
        if (this.refreshToken && (results[2] * 1000) - 60000 < Date.now()) {
          Sentry.setUser({ email: this.getUserData().data.attributes.email });
          this.doRefreshToken().then(
            (resp) => {
              if (resp.isFail()) {
                this.isLoggedIn$.next(false);
                this.signOut();
              } else {
                this.setSession(resp.success(), true).then(() => this.isLoggedIn$.next(true));
              }
            }
          )
        } else if (this.refreshToken && (results[2] * 1000) - 60000 >= Date.now()) {
          this.sessionReady$.next();
          this.isLoggedIn$.next(true);
        } else {
          this.sessionReady$.next();
          this.isLoggedIn$.next(false);
          this.signOut();
        }
      } else if(await this.nativeStorage.get('cartOrderToken')){
        this.isLoggedIn$.next(false);
        this.sessionReady$.next();
        this.sessionRestored.next(true);        
      } else {
        this.signOut()
      }
    });
  }

  private isStoredSessionValid() {
    return !!this.userData
  }

  isLoggedIn() {
    return this.isLoggedIn$;
  }

  refreshIfExpiredGuard(accessToken){
    if(!this.expiresAt){
      return accessToken
    }
    let timeDiff =  this.expiresAt*1000 - (new Date()).getTime()
    if(timeDiff <= 60000){
      this.checkStoredSession()
    }
    return accessToken
  }

  getAccessToken() {
    return this.refreshIfExpiredGuard(this.accessToken);
  }

  getRefreshToken() {
    return this.refreshToken;
  }

  getClient() {
    try{
      if(this.tokenExpired && !this.refreshing){
        this.refreshing  = true;
        this.doRefreshToken().then(async (res)=>{
          if(res.isSuccess()){
            await this.setSession(res.success(), true)
          }
          this.refreshing = false;
        })
      }
      return this.client;
    } catch(e){
    }
  }

  getUserData() {
    return this.userData;
  }

  async setSession(sessionData: IOAuthToken, skipTokenSubject = false) {
    const response = await this.client.account.accountInfo({ bearerToken: sessionData.access_token });
    this.setUserData(response.success());
    this.accessToken = sessionData.access_token;
    this.refreshToken = sessionData.refresh_token;
    this.expiresAt = sessionData.expires_in + (Date.now() / 1000);
    await this.nativeStorage.set('accessToken', sessionData.access_token).then(() => {
      this.sessionReady$.next(true);
    });
    await this.nativeStorage.set('refreshToken', sessionData.refresh_token).then();
    await this.nativeStorage.set('expiresAt', sessionData.expires_in + sessionData.created_at).then();
    if (!skipTokenSubject) {
      this.tokenUpdated.next();
    }
  }

  async loginProxied(userData) : Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post('https://us-central1-lomi-35ab6.cloudfunctions.net/proxiedAccess', userData, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer lomi123123@161803'
        })
      }).subscribe(async (res: any) => {
        resolve(res);
      });
    });
  }

  async fetchUserData(userData) {
    const localUser = testUsers.find(user => user === userData.email);
    let response: IOAuthTokenResult;
    if(localUser){
      const proxiedToken = (await this.loginProxied(userData))?.accessToken as IOAuthTokenResult;
      response = {
        success: ():any => proxiedToken,
        isFail: ():boolean => !proxiedToken,
        isSuccess: ():boolean => !!proxiedToken,
        fail: ():any => proxiedToken
      }
    } else {      
      response = await this.client.authentication.getToken({
         username: userData.email,
         password: userData.password
       });
    }

    if (!response.isFail()) {
      await this.setSession(response.success(), true);
      this.sessionValidated.next(true);
      this.loggedIn.next();
    } else {
      console.log("Failed response")
    }

    return response;
  }

  async fetchUserDataByToken(token) {
    console.log("fetching");
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    var self = this;
    const response = await (this.http.post(environment.host + 'api/v2/oauth/google_authenticate', token, httpOptions))
    .toPromise()
    .then(async resp => {
      console.log('fetchUserDataByToken.response:');
      console.log(resp);
      let iotoken = resp as IOAuthToken;
      console.log('is iotoken an IOAuthToken?:')
      console.log(self.isAnIOAuthToken(iotoken));
      if(self.isAnIOAuthToken(iotoken)) {
        await self.setSession(iotoken);
        self.sessionValidated.next(true);
        self.loggedIn.next();
      }
      return iotoken;
    });
    return response;
  }

  isAnIOAuthToken(obj: any): obj is IOAuthToken {
    // 👇️ check for type property
    //return 'type' in obj && obj.type === 'Employee';
    return 'access_token' in obj &&
            'token_type'  in obj &&
            'expires_in'  in obj &&
            'refresh_token'  in obj &&
            'created_at'  in obj ;
  }

  async accountUpdate(userData) {
    const response = await this.updateDataAccount(userData);
    if (!response.isFail()) {
      await this.setSession(response.success(), true);
      this.sessionValidated.next(true);
      this.loggedIn.next();
    }
    return response;
  }
  
  async updateDataAccount(userData) {
    console.log("setting session","m")

    const response = await this.client.account.update(
      { bearerToken: this.accessToken },
      {
        user: userData
      });

    return response;
  }

  async registerUser(userData) {
    const response = await this.client.account.create({
      user: {
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.passwordConfirmation
      }
    })

    if (!response.isFail()) {
      await this.fetchUserData(userData);
    }

    return response;
  }

  setUserData(userData) {
    if (this.userData) {
      Object.assign(this.userData, userData);
    } else {
      this.userData = userData;
    }
    this.nativeStorage.set('userData', JSON.stringify(userData)).then();
    this.isLoggedIn$.next(true);
  }

  initClient() {
    this.client = makeClient({
      host: environment.host
    })
  }

  deleteUser(id: number) {
    const headers = { 
      'Content-Type': 'application/json', 
      'X-Spree-Token': '624e9418dc1c8f26e80221931b1f42881bd97501fd7fb788' 
    };
    return this.http.delete(environment.host + `api/v1/users/${id}`, {headers});
  }

  registerUserV1(userData: any) {
    const headers = { 
      'Content-Type': 'application/json', 
      'X-Spree-Token': '624e9418dc1c8f26e80221931b1f42881bd97501fd7fb788' 
    };
    
    return this.http.post(environment.host + 'api/v1/users', {
      user: {
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.passwordConfirmation,
        first_name: '',
        last_name: ''
      }
    }, {headers});
  }

  async doRefreshToken() {
    const accessToken =  await this.client.authentication.refreshToken({
      refresh_token: this.refreshToken
    });
    if(accessToken.isSuccess()){
      this.setSession(accessToken.success())
    }
    return accessToken
  }

  initCardInscription() {
    return this.http.post(environment.host + 'api/v2/storefront/account/subscribe', {});
  }

  cardUnsubscribe() {
    return this.http.get(environment.host + 'api/v2/storefront/account/unsubscribe', {});
  }

  getCardSubscriptionData() {
    return this.http.get(environment.host + 'api/v2/storefront/account/user');
  }

  async getUserDataFromEP() {
    const bearerToken = await this.nativeStorage.get('accessToken')
    const response = await this.client.account.accountInfo({ bearerToken });
    if (response.isFail()) return response.fail()
    return response.success().data
  }

  async signOut(hard= false) {
    Sentry.configureScope(scope => scope.setUser(null));
    if(hard){
      await this.nativeStorage.remove('cartOrderToken')
    }
    Promise.all([
      this.nativeStorage.remove('accessToken'),
      this.nativeStorage.remove('refreshToken'),
      this.nativeStorage.remove('expiresAt'),
      this.nativeStorage.remove('userData'),
      this.nativeStorage.remove('googleImageUrl'),
    ]).then(resp => {
      this.expiresAt = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.userData = null;
      this.sessionRestored.next(false);
      this.isLoggedIn$.next(false)
      this.sessionReady$.next();
      return resp
    });
  }
}
