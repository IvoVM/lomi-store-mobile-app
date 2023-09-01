import { Component, Input, OnInit } from '@angular/core';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { ModalController } from '@ionic/angular';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { statesMock } from 'src/utils/states.mock';
import { DeliveryStatusModalComponent } from './delivery-status-modal/delivery-status-modal.component';


@Component({
  selector: 'app-delivery-status',
  templateUrl: './delivery-status.component.html',
  styleUrls: ['./delivery-status.component.scss'],
})
export class DeliveryStatusComponent implements OnInit {

  @Input() pendingOrder
  actualOrder
  state: any
  time: any = 0
  hoursRange = []
  constructor(
    private firestore: Firestore,
    private modalCtrl: ModalController
  ) {
  }

  ngOnInit() {
    this.getPendingOrderFromFirestore()
  }

  async getPendingOrderFromFirestore() {
    const { attributes } = this.pendingOrder
    const q = query(collection(this.firestore, `SPREE_ORDERS_${attributes.stock_locations[0].id}`), where('number', '==', attributes.number))
    onSnapshot(q, { includeMetadataChanges: true }, (snapShotResponse) => {
      let response = {}
      snapShotResponse.forEach((doc) => {
        response = {
          id: doc.id,
          ...doc.data()
        }
        this.actualOrder = response
        if (this.actualOrder.status) { this.state = statesMock[this.actualOrder.status] }
        else if (this.actualOrder.name.includes('Retiro') || this.actualOrder.isStorePicking ) {
          this.time = new Date((this.actualOrder.completed_at.seconds + 259200) * 1000)
          this.state = statesMock[0]
        }
        else if (!this.actualOrder.status && this.actualOrder.scheduled_at) { this.state = statesMock[1] }
        else { this.state = statesMock[2] }

        if (this.actualOrder.scheduled_at) this.calculateTime()
        
        const orderJourneysCollection = collection(this.firestore,`SPREE_ORDERS_${attributes.stock_locations[0].id}/${attributes.number}/journeys`)
        const orderJourneysObservable = collectionData(orderJourneysCollection)
        orderJourneysObservable.subscribe((journeys:any)=>{
          if(journeys.length) {
            this.actualOrder.journeys = journeys[0]
          }
        })
      })
    })
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: DeliveryStatusModalComponent,
      componentProps: { 
        actualOrder: this.actualOrder, 
        hoursRange: this.hoursRange.length? this.hoursRange: '',
        state: this.state, 
        time: this.time,
        tokenOrder: this.pendingOrder.attributes.number
      },
      canDismiss: true,
      breakpoints: [0, 0.6, 0.8, 1],
      initialBreakpoint: 0.6
    });

    modal.present()
  }

  calculateTime() {
    const getHours = this.actualOrder.scheduled_at.split('T')[1].split('-')
    this.hoursRange = [getHours[0].split(':')[0], getHours[1].split(':')[0]]
  }
}
