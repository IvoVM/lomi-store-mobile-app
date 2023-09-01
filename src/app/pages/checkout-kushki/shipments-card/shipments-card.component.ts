import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SHIPMENT } from 'src/app/adapters/IShipment';
import { DeliverySheduleComponent } from 'src/app/modals/delivery-shedule/delivery-shedule.component';
import { AddressService } from 'src/app/services/address.service';
import { ModalsService } from 'src/app/services/modals.service';
import { ShipmentScheduledService } from 'src/app/services/shipment-scheduled.service';
import { scheduledUtils } from 'src/utils/scheduled';

@Component({
  selector: 'app-shipments-card',
  templateUrl: './shipments-card.component.html',
  styleUrls: ['./shipments-card.component.scss'],
})
export class ShipmentsCardComponent implements OnInit {

  @Input() shipment
  images = []
  hourDelivery = {
    day: 'Hoy',
    hour: { id: 0, blok: 'Inmediata, en la proxima hora', initialHour: 0}
  };
  openedDays = []
  schedules: any
  st: any

  constructor(
    private modalCtrl: ModalController,
    private shipmentScheduledService: ShipmentScheduledService,
    private modalsService: ModalsService,
    private addressService: AddressService
  ) {
  }

  ngOnInit() {
    this.st = this.shipment.relationships.stock_location.data.id
    this.addressService.getStockLocationschedule(this.st).subscribe((schedules) => {
      this.schedules = schedules
      this.searchOpenScheduled()
    })
    const { products } = this.shipment
    products.forEach(product => {
      const { images } = product.data
      if (images.length > 0) this.images.push(images[0].attributes.cdn_url)
    });
  }

  async openProductsModal() {
    this.modalsService.openCart(false, 'modal-85vh', false, {
      lineItems: this.shipment.line_items,
      products: this.shipment.products,
      shipmentInfo: {
        ...this.shipment.attributes,
        schedule: this.hourDelivery
      }
    })
  }

  async openDeliveryShedule() {
    const modal = await this.modalCtrl.create({
      component: DeliverySheduleComponent,
      canDismiss: true,
      cssClass: 'delivery-shedule',
      componentProps: {
        stockLocationId: this.st,
        shipmentType: this.addressService.shipmentType == 'delivery' ? SHIPMENT.DELIVERY : SHIPMENT.PICKUP,
        schedules: this.schedules
      }
    })
    await modal.present();
    let { data } = await modal.onWillDismiss()
    if (data) {
      const scheduled = {
        id: this.shipment.id,
        data
      }
      this.hourDelivery.day = data.day
      this.hourDelivery.hour = data.hour
      this.setShipmentSchedule(scheduled)
    }
  }

  setShipmentSchedule (scheduled) {
    const shipmentScheduled = this.shipmentScheduledService.shipmentScheduled$.getValue()
    const index = shipmentScheduled.map(shipment => shipment.id).indexOf(scheduled.id)
    if (index != -1) shipmentScheduled.splice(index, 1)
    shipmentScheduled.push(scheduled)
    this.shipmentScheduledService.shipmentScheduled$.next(shipmentScheduled)
  }

  searchOpenScheduled() {
    const date = new Date()
    const currentDay = date.getDay()

    let nextDayValue = 0
    while(this.openedDays.length < 1) {
      const actualDate = new Date()
      const nextOpenDay = (currentDay + nextDayValue) % 7
      const schedule = this.schedules[nextOpenDay]
      const actualHour = actualDate.getHours()
      const actualMinutes = actualDate.getMinutes()
      const hourWithMinutes = actualHour + (0.01 * actualMinutes)
      const endHourToday = new Date(schedule.ends_at).getHours()
      const startHourToday = new Date(schedule.starts_at).getHours()
      if (!schedule.closed) {
        if (nextOpenDay == currentDay) {
          if (!(hourWithMinutes >= endHourToday - 0.55)) {
            this.hourDelivery.day = 'Hoy'
            this.hourDelivery.hour = scheduledUtils.getDeliveryHour(schedule)
            this.openedDays.push('Hoy')
          }
        } else if (nextOpenDay == currentDay + 1) {
          this.hourDelivery.day = 'Mañana'
          this.hourDelivery.hour = scheduledUtils.getDeliveryHour(schedule)
          this.openedDays.push('Mañana')
          const scheduled = {
            id: this.shipment.id,
            data: this.hourDelivery
          }
          this.setShipmentSchedule(scheduled)
        } else {
          const newDate = new Date(actualDate.setDate(date.getDate() + nextDayValue))
          const scheduleDate = `${newDate.getDate()}/${newDate.getMonth() + 1}/${newDate.getFullYear()}`
          this.hourDelivery.day = scheduleDate
          this.hourDelivery.hour = { id: 0, initialHour: startHourToday, blok: `${startHourToday}:00 - ${startHourToday + 2}:00` }
          this.openedDays.push(scheduleDate)
          const scheduled = {
            id: this.shipment.id,
            data: this.hourDelivery
          }
          this.setShipmentSchedule(scheduled)
        }
      } 
      nextDayValue ++
    }

  }

}
