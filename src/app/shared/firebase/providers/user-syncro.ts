//new provider for user syncro

import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Firestore } from '@angular/fire/firestore';
import { init } from '@sentry/browser';
import { collection, doc, DocumentReference, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { SecurityProvider } from 'src/app/services/security.service';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { Platform } from '@ionic/angular';
import { firestoreUser, UserDevice } from './user-syncro.types';
import { appVersionData } from 'src/app/app-version';
import { Unsubscribe } from 'firebase/app-check';
import { LaunchDarklyService } from 'src/app/services/launch-darkly.service';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Injectable({
    providedIn: 'root'
})
export class UserSyncroService {
    
        private user: firestoreUser;
        private userDoc: DocumentReference;
        private deviceDoc: DocumentReference;
        private unsubscribeUserSnapshot: Unsubscribe;

        constructor(
            private securityService: SecurityProvider,
            private firestore: Firestore,
            private device: Device,
            private platform: Platform,
            private launchDarkly: LaunchDarklyService,
            private userEvents: UserEventsService,
        ) {
            this.initSyncroService();
        }

        initSyncroService(){
            this.platform.ready().then(() => {
                if(!window.analytics.user){
                    setTimeout(() => {
                        this.initSyncroService();
                    }, 200)
                    return
                }
                
                this.user = {
                    id: window.analytics.user().anonymousId(),
                    last_connected: new Date(),
                };
                this.userDoc = doc(this.firestore,"users/"+this.user.id);   
                this.deviceDoc = doc(this.firestore,"users/"+this.user.id+"/devices/"+this.user.id);            
                this.listenForChanges()
                this.listenUserLoggedIn();
                setInterval(async () => {
                    await this.platform.ready()
                    this.trackUserOnline();
                }, 300000); 
                
            })
        }

        async listenForChanges(){
            this.unsubscribeUserSnapshot ? await this.unsubscribeUserSnapshot() : null;
            this.unsubscribeUserSnapshot = onSnapshot(this.userDoc,(userDocSnapshot)=>{
                const data = userDocSnapshot.data()
                if(!data){
                    setDoc(this.userDoc,{
                        last_login: new Date()
                    });
                    setDoc(this.deviceDoc,this.getUserDevice())
                }
            })
        }

        listenUserLoggedIn(){
            this.securityService.isLoggedIn().subscribe(async (user) => {
                await this.platform.ready()
                if(this.securityService.getUserData().data){
                    this.user.id = this.securityService.getUserData().data.id
                }
                this.userDoc = doc(this.firestore,"users/"+this.user.id);
                this.securityService.getUserData() ? 
                this.user.id = this.securityService.getUserData().data.id : null;
                const userData = this.securityService.getUserData();
                const userDevice = this.getUserDevice();
                this.deviceDoc = doc(this.firestore,"users/"+this.user.id+"/devices/"+userDevice.uuid);            
                this.listenForChanges()
            });
        }

        getUserDevice() : UserDevice{
            const UserDevice:UserDevice = {
                uuid: window.analytics.user().anonymousId(),
                version: appVersionData.versionName,
                agent:  navigator.userAgent
            }
            return UserDevice
        }

        trackUserOnline = async () => {
            await this.getUserDevice()
            const ldFlags = this.launchDarkly.client.allFlags()
            const userEvents = this.userEvents.describeUserEvents();
            updateDoc(this.userDoc,{
                    launchDarklyFlags: ldFlags,
                    userEvents,
                    ...this.user,
                    last_connected: new Date(),
                }).then((res)=>{
                    console.log(res, this.userDoc)
                });
            setDoc(this.deviceDoc,this.getUserDevice())
        }
    }