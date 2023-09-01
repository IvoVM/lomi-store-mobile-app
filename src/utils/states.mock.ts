export const statesMock = [
  { 
    state: 'Retiro en Tienda',
    title: 'Tu pedido está listo para ser retirado',
    subTitle: 'Puedes retirarlo hasta el:',
    progress: 0.14
  },
  { 
    state: 'Programado',
    title: 'Tu pedido está programado',
    subTitle: 'Tu pedido llegará',
    progress: 0.28
  },
  { 
    state: 'Pendiente',
    title: 'Tu pedido está pendiente',
    subTitle: 'Tu pedido llegará',
    progress: 0.42
  },
  { 
    state: 'On Picking',
    title: 'Tu pedido está preparandose en tienda',
    subTitle: 'Tu pedido llegará',
    progress: 0.57
  },
  { 
    state: 'Esperando al repartidor',
    title: 'Tu pedido está esperando al repartidor',
    subTitle: 'Tu pedido llegará',
    progress: 0.71
  },
  { 
    state: 'Entregando',
    title: 'Tu pedido va en camino',
    subTitle: 'Tu pedido llegará',
    progress: 0.85
  },
  {
    state: 'Completado',
    title: 'Completado',
    subTitle: 'Entregado. Que lo disfrutes!',
    progress: 1
  },
  {
    state: 'Fallido',
    title: 'UPS!',
    subTitle: 'Tuvimos un problema con tu pedido',
    progress: 0
  }
  ]

export const STORE_PICKING_STATE = 0
export const SCHEDULED_STATE = 1
export const PENDING_STATE = 2
export const ON_PICKING_STATE = 3
export const WAITING_AT_DRIVER_STATE = 4
export const DELIVERING_ORDER_STATE = 5
export const FINISHED_STATE = 6
export const FAILED = 7
