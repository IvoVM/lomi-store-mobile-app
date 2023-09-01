import { TestBed } from '@angular/core/testing';

import { CheckoutPageGuard } from './checkout-page.guard';

describe('CheckoutPageGuard', () => {
  let guard: CheckoutPageGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CheckoutPageGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
