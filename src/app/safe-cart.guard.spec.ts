import { TestBed } from '@angular/core/testing';

import { SafeCartGuard } from './safe-cart.guard';

describe('SafeCartGuard', () => {
  let guard: SafeCartGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(SafeCartGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
