import { Component, ElementRef, OnInit, Renderer2, ViewChild, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { SHIPMENT } from 'src/app/adapters/IShipment';
import { AddressService } from 'src/app/services/address.service';
import { scheduledUtils } from 'src/utils/scheduled';

@Component({
  selector: 'app-delivery-shedule',
  templateUrl: './delivery-shedule.component.html',
  styleUrls: ['./delivery-shedule.component.scss'],
})
export class DeliverySheduleComponent implements OnInit {

  @Input() stockLocationId = ''
  @Input() shipmentType
  days = [];
  blocktime = []
  todayBlokTime = []
  tommorowBlokTime = []
  hoursCopy;
  chosenDayTarget;
  deliveryDay;
  chosenHourTarget;
  deliveryHour;
  actualHour;
  disabledToday = false
  startHourToday: any
  endHourToday: any
  disabledTomorrow = false
  schedules

  constructor(
    private renderer: Renderer2,
    private modalCtrl: ModalController,
    private nativeStorage: Storage,
    private addressService: AddressService
    ) { }

  async ngOnInit() {
    this.days = []
    this.searchOpenScheduled()
  }

  getScheduleDayTime(schedules) {
    const currentDay = new Date().getDay()
    const tommorowDay = currentDay == 6 ? 0: currentDay + 1 

    schedules.forEach(schedule => {
      if (schedule.day_code == currentDay) return this.createBlokTime(schedule, 'Hoy')
      if (schedule.day_code == tommorowDay) return this.createBlokTime(schedule, 'Mañana')
    });
  }

  createBlokTime(schedule, day) {
    const scheduleStartsAt = new Date(schedule.starts_at).getHours()
    const scheduleEndsAt = new Date(schedule.ends_at).getHours()

    const loops = Math.round((scheduleEndsAt - scheduleStartsAt) / 2)
    const evaluateRangeTime = []
    let startHour = scheduleStartsAt
    for (let i = 0; i < loops; i++) {
      let range
      let endHour = 0
      if (i == loops - 1)  {
        endHour = scheduleEndsAt
      } else {
        endHour = startHour + 2
      }
      range ={ initialHour: startHour, blok: `${startHour}:00 - ${endHour}:00` }
      startHour = endHour
      evaluateRangeTime.push(range)
    }
    this.blocktime.push(evaluateRangeTime)
    if (day === 'Hoy') this.todayBlokTime.unshift({ initialHour: -1, blok: 'Inmediata, en la proxima hora'})
  }

  setDeliveryDay(day, index): any {
    this.deliveryHour = []
    this.deliveryDay = day
    this.hoursCopy = this.blocktime[index]
  }

  setDeliveryHour(hour): any {
    this.deliveryHour = hour;
  }

  setDeliveryShedule() {
    let deliveryShedule = {
      day: this.deliveryDay,
      hour: this.deliveryHour
    }
    if (!deliveryShedule['day'] && deliveryShedule['hour'].length === 0) {
      this.modalCtrl.dismiss()
    } else if (deliveryShedule['day'] &&  Object.keys(deliveryShedule['hour']).length > 0){
      this.modalCtrl.dismiss(deliveryShedule)
    } else {
      console.log('NO PUEDE SALIR')
    }
  }

  searchOpenScheduled() {
    const date = new Date()
    const currentDay = date.getDay()
    let nextDayValue = 0
    while(this.days.length < 2) {
      const actualDate = new Date()
      const nextOpenDay = (currentDay + nextDayValue) % 7
      const schedule = this.schedules[nextOpenDay]
      const actualHour = actualDate.getHours()
      const actualMinutes = actualDate.getMinutes()
      const hourWithMinutes = actualHour + (0.01 * actualMinutes)
      const endHourToday = new Date(schedule.ends_at).getHours()
      if (!schedule.closed) {
        if (nextOpenDay == currentDay) {
          if (!(hourWithMinutes >= endHourToday - 0.55)) {
            this.days.push('Hoy')
            this.createBlokTime(schedule, this.days.length == 0 ? 'Hoy': 'Mañana')
            const initialScheduled = scheduledUtils.getDeliveryDay(schedule)
            this.deliveryDay = 'Hoy'
            this.hoursCopy = this.blocktime[0]
            this.deliveryHour = initialScheduled.deliveryHour
          }
        } else if (nextOpenDay == currentDay + 1) {
          this.days.push('Mañana')
          this.createBlokTime(schedule, this.days.length == 0 ? 'Hoy': 'Mañana')
          this.hoursCopy = this.blocktime[0]
          const initialScheduled = scheduledUtils.getDeliveryDay(schedule)
          this.deliveryDay = initialScheduled.deliveryDay
          this.deliveryHour = initialScheduled.deliveryHour
        } else {
          const newDate = new Date(actualDate.setDate(date.getDate() + nextDayValue))
          const scheduleDate = `${newDate.getDate()}/${newDate.getMonth() + 1}/${newDate.getFullYear()}`
          this.days.push(scheduleDate)
          this.createBlokTime(newDate.getDay() == 0 ? this.schedules[0]: schedule, scheduleDate)
          this.deliveryDay = this.days[0]
          this.hoursCopy = this.blocktime[0]
          this.deliveryHour = this.hoursCopy[0]
        }
      } 
      nextDayValue ++
    }
  }

  closeModal() {
    this.modalCtrl.dismiss()
  }

}
