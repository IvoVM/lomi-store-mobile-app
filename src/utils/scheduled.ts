export const scheduledUtils = {
    getDeliveryDay: (schedule) => {
        const actualHour = new Date().getHours()
        const actualMinutes = new Date().getMinutes()
        const startHourToday = new Date(schedule.starts_at).getHours()
        const endHourToday = new Date(schedule.ends_at).getHours()
        let deliveryDay = ''
        let deliveryHour
        const hourWithMinutes = actualHour + (0.01 * actualMinutes)
        if (hourWithMinutes <= endHourToday - 0.55 && actualHour >= startHourToday) {
            deliveryDay = 'Hoy'
            deliveryHour = { initialHour: -1, blok: 'Inmediata, en la proxima hora'}
        } else if (actualHour <= startHourToday && actualHour >= 0) { 
            deliveryDay = 'Hoy'
            deliveryHour = { initialHour: startHourToday, blok: `${startHourToday}:00 - ${startHourToday + 2}:00` }
        } else {
            deliveryHour = { initialHour: startHourToday, blok: `${startHourToday}:00 - ${startHourToday + 2}:00` }
        }
        return { deliveryDay, deliveryHour}
    },

    getDeliveryHour: (schedule) => {
        const actualHour = new Date().getHours()
        const actualMinutes = new Date().getMinutes()
        const startHourToday = new Date(schedule.starts_at).getHours()
        const endHourToday = new Date(schedule.ends_at).getHours()
        let deliveryHour
        const hourWithMinutes = actualHour + (0.01 * actualMinutes)
        if (hourWithMinutes <= endHourToday - 0.55 && actualHour >= startHourToday) {
            deliveryHour = { initialHour: -1, blok: 'Inmediata, en la proxima hora'}
        } else if (actualHour <= startHourToday && actualHour >= 0) { 
            deliveryHour = { initialHour: startHourToday, blok: `${startHourToday}:00 - ${startHourToday + 2}:00` }
        } else {
            deliveryHour = { initialHour: startHourToday, blok: `${startHourToday}:00 - ${startHourToday + 2}:00` }
        }
        return deliveryHour

    }
}