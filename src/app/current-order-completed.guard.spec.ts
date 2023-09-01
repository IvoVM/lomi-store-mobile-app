import { TestBed } from '@angular/core/testing';

import { CurrentOrderCompletedGuard } from './current-order-completed.guard';

describe('CurrentOrderCompletedGuard', () => {
  let guard: CurrentOrderCompletedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CurrentOrderCompletedGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
