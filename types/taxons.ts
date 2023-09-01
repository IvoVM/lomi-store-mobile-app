import { TaxonAttr } from "@spree/storefront-api-v2-sdk/types/interfaces/Taxon";

export type TaxonAttrLomi = TaxonAttr & {
    attributes: {
        show_into_home: boolean;
        hide_from_nav: boolean;
    }
}