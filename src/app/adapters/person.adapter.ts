export interface IPerson {
    data : {
        attributes: {
            completed_orders: null,
            email: null,
            store_credits: null,
            first_name: null,
            last_name: null,
            born_date: null,
            gender: null,
            is_prime: null,
            prime_expiration: null,
            city: null
          },
          id: null,
          relationships: {
            default_billing_address: {
              data: null
            },
            default_shipping_address: {
              data: null
            }
          },
          type: 'user'
    };
}
