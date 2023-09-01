import { ApplyCouponCodeEventParams, ApplyLatamCodeEventParams, BannerClickedEventParams, CouponAppliedEventParams, ErrorProductStockParams, eventWithMessageParams, ModalOrderSummaryLoadFailEventParams, openBoxModalEventParams, OrderCompletedEventParams, OrderDetailClickedEventParams, ProductAddedEventParams, ProductListViewedEventParams, ProductRemovedEventParams, ProductSearchedExpandedEventParams, ProductSearchedLoadedEventParams, ProductVariantClickedEventParams, ProductViewedEventParams, RecipeEventParams, RepeatOrderDoneEventParams, SearchEventParams, shopCategoriesClickedEventParams, swimlineExpandedEventParams, TransactionErrorEventParams, TransactionEventParams, UserSignedInEventParams, UserSignedUpEventParams } from "./user-events.types"


export function track(event, body = null){
    let trackingProvidersFunctionStack = []

    if(body){
        window.analytics? window.analytics.track(event, body) : null
        window.ganalytics ? window.ganalytics.logEvent(event,body) : null
        window.intercomAnalytics ? window.intercomAnalytics.trackEvent(event,body) : null
    } else {
        window.analytics.track(event) ? window.analytics.track(event) : null
        window.ganalytics ? window.ganalytics.logEvent(event) : null
        window.intercomAnalytics ? window.intercomAnalytics.trackEvent(event) : null
    }
}

export class defaultUserEvent{
    name : string
    constructor(eventName){
        this.name = eventName
    }
    
    async track(params : null = null){
        track(this.name)
    }
}


export class UserEventsWithParameters extends defaultUserEvent{

    constructor(name){
        super(name)
    }
    
    async track(params:Object){
        return track(this.name, params)
    }
}

//Non-Generic Event Classes

export class ModalOpenedEvent extends defaultUserEvent{
    constructor(){
        super("_modal.opened")
    }

    async track(modalName:string){
        return track(modalName + this.name)
    }
}

export class UserSignedInEvent extends UserEventsWithParameters{
    constructor(){
        super("userSignedIn")
    }

    async track(params:UserSignedInEventParams){
        return track(this.name, params)
    }
}

export class EventWithMessage extends UserEventsWithParameters{
    constructor(name){
        super(name)
    }

    async track(params:eventWithMessageParams){
        return track(this.name, params)
    }
}

export class UserSignedUpEvent extends UserEventsWithParameters{
    constructor(){
        super("userSignedUp")
    }

    async track(params:UserSignedUpEventParams){
        return track(this.name, params)
    }
}

export class RepeatOrderDoneEvent extends UserEventsWithParameters{
    constructor(){
        super('repeat_order.done')
    }

    async track(params:RepeatOrderDoneEventParams){
        return track(this.name, params)
    }
}

export class ProductSearchedExpandedEvent extends UserEventsWithParameters{
    constructor(){
        super('product_searched.expanded')
    }

    async track(params:ProductSearchedExpandedEventParams){
        return track(this.name, params)
    }
}

export class OrdersDetailsClickedEvent extends UserEventsWithParameters{
    constructor(){
        super('order_details.clicked')
    }

    async track(params:OrderDetailClickedEventParams){
        return track(this.name, params)
    }
}

export class ProductRemovedEvent extends UserEventsWithParameters{
    constructor(){
        super('product.removed')
    }

    async track(params:ProductRemovedEventParams){
        return track(this.name, params)
    }
}

export class ProductAddedEvent extends UserEventsWithParameters{
    constructor(){
        super('product.added')
    }

    async track(params:ProductAddedEventParams){
        return track(this.name, params)
    }
}

export class ProductViewedEvent extends UserEventsWithParameters{
    constructor(){
        super("product.viewed")
    }

    async track(params:ProductViewedEventParams){
        return track(this.name, params)
    }
}


export class UserSearchedProductEvent extends UserEventsWithParameters{
    constructor(){
        super('product_searched.loaded')
    }

    async track(params:ProductSearchedLoadedEventParams){
        return track(this.name, params)
    }
}

export class SwimlineExpandedEvent extends UserEventsWithParameters{
    constructor(){
        super('swimline_expand.clicked')
    }

    async track(params:swimlineExpandedEventParams){
        return track(this.name, params)
    }
}

export class CouponAppliedEvent extends UserEventsWithParameters{
    constructor(){
        super('coupon.applied')
    }

    async track(params:CouponAppliedEventParams){
        return track(this.name, params)
    }
}

export class ProductListViewedEvent extends UserEventsWithParameters{
    constructor(){
        super('productListViewed')
    }

    async track(params:ProductListViewedEventParams){
        return track(this.name, params)
    }
}

export class TransactionEvent extends UserEventsWithParameters{
    constructor(action:string){
        super('transaction.'+action)
    }

    async track(params:TransactionEventParams | TransactionErrorEventParams){
        return track(this.name, params)
    }
}

export class TransactionErrorEvent extends UserEventsWithParameters{
    constructor(){
        super('transaction_error.loaded')
    }

    async track(params:TransactionErrorEventParams){
        return track(this.name, params)
    }
}

export class OrderCompletedEvent extends UserEventsWithParameters{
    constructor(){
        super('OrderCompleted')
    }

    async track(params:OrderCompletedEventParams){
        return track(this.name, params)
    }
}

export class ApplyLatamCodeEvent extends UserEventsWithParameters{
    constructor(){
        super('LatamCode')
    }

    async track(params:ApplyLatamCodeEventParams){
        return track(this.name, params)
    }
}

export class ModalOrderSummaryLoadFailEvent extends UserEventsWithParameters{
    constructor(){
        super('modal_order_summary.load_fail')
    }

    async track(params:ModalOrderSummaryLoadFailEventParams){
        return track(this.name, params)
    }
}

export class ShopCategoriesClickedEvent extends UserEventsWithParameters{
    constructor(){
        super('shop_categories.clicked')
    }

    async track(params:shopCategoriesClickedEventParams){
        return track(this.name, params)
    }
}

export class SearchEvent extends UserEventsWithParameters{
    constructor(){
        super('productsSearched')
    }

    async track(params:SearchEventParams){
        return track(this.name, params)
    }
}

export class ProductVariantClickedEvent extends UserEventsWithParameters{
    constructor(){
        super('product_variant.clicked')
    }

    async track(params:ProductVariantClickedEventParams){
        return track(this.name, params)
    }
}

export class BannerClickedEvent extends UserEventsWithParameters{
    constructor(){
        super('banner.clicked')
    }

    async track(params:BannerClickedEventParams){
        return track(this.name, params)
    }
}

export class OpenBoxModalEvent extends UserEventsWithParameters{
    constructor(action){
        super( action ? ( 'openBoxModal.' + action ) : 'openBoxModal' )
    }

    async track(params:openBoxModalEventParams){
        return track(this.name, params)
    }
}

export class RecipeEvent extends UserEventsWithParameters{
    async track(params:RecipeEventParams){
        return track(this.name, params)
    }
}

export class ErrorProductStockEvent extends UserEventsWithParameters{
    constructor(){
        super("error_product_stock.added")
    }
    
    async track(params: ErrorProductStockParams){
        return track(this.name, params)
    }
}