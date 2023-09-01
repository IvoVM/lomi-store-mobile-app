export type openBoxModalEventParams = {
    mix: any
}

export type RecipeEventParams = {
    recipe: any
}

export type eventWithMessageParams = {
    message: string
}

export type ApplyLatamCodeEventParams = {
    email : string,
    latam_code: string,
}

export type ApplyCouponCodeEventParams = {
    email: string,
    coupon: string
}

export type LineItem = {
    name: string,
    quantity: number
}

export type OrderCompletedEventParams = {
    coupon: string,
    currency: string,
    total_discount: number
    order_id: string,
    products: Array<any>,
    shipping_mode: number,
    shipping: number,
    tax: number,
    total: number,
    userId: number,
    email: string,
    device: string,
    store: string,
    stock_location_id: number
}

export type TransactionErrorEventParams = TransactionEventParams & {
    transactionError: string,
    transactionErrorId: string,
    stockLocationId?: number
}

export type TransactionEventParams = {
    cartNumber: string
}

export type productListItem = {
    id: string,
    product: string,
    index: string,
    image: string,
}

export type ProductListViewedEventParams = {
    taxonId: string,
    data: productListItem[]
}

export type CouponAppliedEventParams = {
    coupon_code: string
}

export type swimlineExpandedEventParams = {
    taxon: string,
    link: string
}

export type shopCategoriesClickedEventParams = {
    id: string,
    name: string
}

export type productEventParams = {
    "currency": string,
    "item": {
        "id" : string,
        "name": string,
        "description": string,
        "producer_id": string,
        "currency": string,
        "price": string,
        "display_price": string,
        "compare_at_price": string,
        "display_compare_at_price": string,
        "sku": string,
        "weight": string,
        "height": string,
        "width": string,
        "depth": string,
        "is_master": boolean,
        "options_text": string,
        "purchasable": boolean,
        "in_stock": boolean,
        "backorderable": boolean,
        "quantity": number
    },
    "value": string
}
export type ProductViewedEventParams = productEventParams //Same properties as above
export type ProductAddedEventParams = productEventParams //idem
export type ProductRemovedEventParams = productEventParams //idem

export type OrderDetailClickedEventParams = {
    number: string
}

export type ProductSearchedLoadedEventParams = {
    keyword_searched: string,
    products_id : Array<string>
}

export type ProductSearchedExpandedEventParams = {
    keyword_searched: string,
    products_id : Array<string>
}

export type UserSignedInEventParams = {
    id: string,
    email: string,
    newUser: number
}

export type UserSignedUpEventParams = UserSignedInEventParams

export type RepeatOrderDoneEventParams = TransactionEventParams
export type ModalOrderSummaryLoadFailEventParams = TransactionEventParams
export type SearchEventParams = {
    query: string
}

export type ProductVariantClickedEventParams = {
    variantId: string,
}

export type BannerClickedEventParams = {
    promotionPath: string
}

export type ErrorProductStockParams = {
    productId: string,
    variantId: string,
}