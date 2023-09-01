import { Injectable } from '@angular/core';
import { ApplyLatamCodeEvent, BannerClickedEvent, CouponAppliedEvent, defaultUserEvent, ErrorProductStockEvent, EventWithMessage, ModalOpenedEvent, ModalOrderSummaryLoadFailEvent, OpenBoxModalEvent, OrderCompletedEvent, OrdersDetailsClickedEvent, ProductAddedEvent, ProductListViewedEvent, ProductRemovedEvent, ProductSearchedExpandedEvent, ProductVariantClickedEvent, ProductViewedEvent, RecipeEvent, RepeatOrderDoneEvent, SearchEvent, ShopCategoriesClickedEvent, SwimlineExpandedEvent, TransactionErrorEvent, TransactionEvent, UserEventsWithParameters, UserSearchedProductEvent, UserSignedInEvent, UserSignedUpEvent } from './user-events.classes';
import { getAnalytics } from "firebase/analytics";
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import { Intercom } from 'ng-intercom';

@Injectable({
  providedIn: 'root'
})
export class UserEventsService {

  public userEvents = {

    //Home Screen
    "home_screen.loaded": new defaultUserEvent("home_screen.loaded"),
    "discover_screen.loaded": new defaultUserEvent("discover_screen.loaded"),
    "shop_categories.loaded": new defaultUserEvent("shop_categories.loaded"),
    "shop_categories.clicked": new ShopCategoriesClickedEvent(),
    "banner.clicked": new BannerClickedEvent(),

    //Login flow
    "login_screen.loaded" : new defaultUserEvent("login_screen.loaded"),
    "login_screen.clicked" : new defaultUserEvent("login_screen.clicked"),
    'registration.clicked': new defaultUserEvent('registration.clicked'),
    'registration.loaded': new defaultUserEvent('registration.loaded'),
    "userSignedIn": new UserSignedInEvent(),
    "userSignedUp": new UserSignedUpEvent(),

    //Menu
    "menu.clicked": new defaultUserEvent("menu.clicked"),
    "menu.loaded": new defaultUserEvent("menu.loaded"),
    "customer_service.clicked": new defaultUserEvent("customer_service.clicked"),
    "my_orders.clicked": new defaultUserEvent("my_orders.clicked"),
    "faq.clicked": new defaultUserEvent("faq.clicked"),
    "t_and_c.clicked": new defaultUserEvent("t_and_c.clicked"),
    "payment_method.clicked": new defaultUserEvent("payment_method.clicked"),
    "my_miles_latam.clicked": new defaultUserEvent("my_miles_latam.clicked"),

    //Profile
    "profile.clicked": new defaultUserEvent("profile.clicked"),
    "profile.loaded": new defaultUserEvent("profile.loaded"),
    "create.clicked": new UserEventsWithParameters("create.clicked"),

    //Product
    'product.clicked': new defaultUserEvent('product.clicked'),
    "error_product_stock.added": new ErrorProductStockEvent(),
    'product.added': new ProductAddedEvent(),
    "product.removed": new ProductRemovedEvent(),
    "product.viewed": new ProductViewedEvent(),
    "product_variant.clicked": new ProductVariantClickedEvent(),


    //Repeat Order
    "repeat_order.clicked" : new defaultUserEvent("repeat_order.clicked"),
    "repeat_order.done": new RepeatOrderDoneEvent(),

    //Cart
    "cart.loaded": new defaultUserEvent("cart.loaded"),
    "cart.clicked": new defaultUserEvent("cart.clicked"),
    "cart.viewed": new UserEventsWithParameters("cart.viewed"),
    "cart.deleted": new defaultUserEvent("cart.deleted"),
    "checkout.clicked": new defaultUserEvent("checkout.clicked"),
    "coupon.clicked": new defaultUserEvent("coupon.clicked"),
    "coupon.applied": new CouponAppliedEvent(),

    //Checkout
    "checkoutStepViewed": new defaultUserEvent("checkoutStepViewed"),
    "transaction.clicked": new TransactionEvent("clicked"),
    "transaction.success": new TransactionEvent("success"),
    "transaction.failed": new TransactionEvent("failed"),
    "transaction_error.loaded": new TransactionErrorEvent(),
    "orderCompleted": new OrderCompletedEvent(),
    "kushki_confirmation.loaded": new defaultUserEvent("kushki_confirmation.loaded"),
    "edenred_confirmation.loaded": new defaultUserEvent("edenred_confirmation.loaded"),
    "transaction_error_kushki.loaded": new EventWithMessage("transaction_error_kushki.loaded"),
    'transaction_error_edenred.loaded': new EventWithMessage("transaction_error_edenred.loaded"),
    'error_credit_card.loaded': new UserEventsWithParameters('error_credit_card.loaded'),
    'credit_card_confirmation.loaded': new defaultUserEvent('credit_card_confirmation.loaded'),

    //Order History
    "orders_details.loaded": new defaultUserEvent("orders_details.loaded"),
    'order_details.clicked': new OrdersDetailsClickedEvent(),
    
    //Addres
    "address.clicked": new defaultUserEvent("address.clicked"),
    "delivery_address.clicked": new defaultUserEvent("delivery_address.clicked"),
    "delivery_address.loaded": new defaultUserEvent("delivery_address.loaded"),
    "store_pickup.clicked": new defaultUserEvent("store_pickup.clicked"),
    "location.loaded": new defaultUserEvent("location.loaded"),
    "location_address.saved": new defaultUserEvent("location_address.saved"),
    "location_address.deleted": new defaultUserEvent("location_address.deleted"),
    "new_location_address.clicked": new defaultUserEvent("new_location_address.clicked"),
    "saved_location_address.clicked": new defaultUserEvent("saved_location_address.clicked"),

    //Checkout
    "order_waiting.loaded": new defaultUserEvent("order_waiting.loaded"),
    "latam_code": new ApplyLatamCodeEvent(),
    "payment_method.select": new UserEventsWithParameters("payment_method.select"),
    //Search Bar
    "search_bar.loaded": new defaultUserEvent("search_bar.loaded"),
    "search_bar.clicked": new defaultUserEvent("search_bar.clicked"),
    "product_searched.expanded": new ProductSearchedExpandedEvent(),
    "product_searched.loaded": new UserSearchedProductEvent(),
    "productsSearched": new SearchEvent(),

    //Producers
    'local_suppliers.clicked': new defaultUserEvent('local_suppliers.clicked'),

    //LomiBox
    "openBoxModal.clicked": new OpenBoxModalEvent('clicked'),
    "openBoxModal.added": new OpenBoxModalEvent('added'),
    "lomi_box_category_screen.loaded": new defaultUserEvent('lomi_box_category_screen.loaded'),
    'lomi_box_modal.loaded': new defaultUserEvent('lomi_box_modal.loaded'),
    "removeLikeRecipe.clicked": new RecipeEvent("removeLikeRecipe.clicked"),
    'likeRecipe.clicked': new RecipeEvent('likeRecipe.clicked'),
    'lomi_box_screen.loaded': new defaultUserEvent('lomi_box_screen.loaded'),
    'goToCategory.clicked': new defaultUserEvent('goToCategory.clicked'),
    
    //Recipes
    "removeUnLikeRecipe.clicked": new RecipeEvent("removeUnLIkeRecipe.clicked"),
    'unlikeRecipe.clicked': new RecipeEvent('unlikeRecipe.clicked'),
    'recipe_screen.loaded': new defaultUserEvent('recipe_screen.loaded'),
    'pickRandomRecepy.clicked': new defaultUserEvent('pickRandomRecepy.clicked'),
    'openRecipe.clicked': new RecipeEvent('openRecipe.clicked'),

    //Misc
    "about_you.loaded": new defaultUserEvent("about_you.loaded"),
    "back_button.clicked": new defaultUserEvent("back_button.clicked"),
    "modal_order_summary.load_fail": new ModalOrderSummaryLoadFailEvent(),
    "componentName_modal.opened" : new ModalOpenedEvent(),
    "closeModal.clicked": new defaultUserEvent("closeModal.clicked"),
    'addAllProducts.clicked': new defaultUserEvent('addAllProducts.clicked'),
    'goToChild.clicked': new defaultUserEvent('goToChild.clicked'),


    "loading.check": new UserEventsWithParameters("loading.check"),

    //Taxon
    'swimline_expand.clicked': new SwimlineExpandedEvent(),
    "productListViewed": new ProductListViewedEvent(),

    //Sales
    'promotion.clicked': new defaultUserEvent("promotion.clicked"),

  } 

  describeUserEvents() {
    const events = []
    for (let eventName in this.userEvents) {
      let event = this.userEvents[eventName];
      events.push(eventName)
    }
    return events
  }

  constructor(analytics: AngularFireAnalytics, intercom: Intercom) {
    window.ganalytics = analytics;
    window.intercomAnalytics = intercom;
  }
}
