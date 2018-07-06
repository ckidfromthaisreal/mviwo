import { TestBed, inject } from '@angular/core/testing';

import { RedirectAuthGuardService } from './redirect-auth-guard.service';

describe('RedirectAuthGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RedirectAuthGuardService]
    });
  });

  it('should be created', inject([RedirectAuthGuardService], (service: RedirectAuthGuardService) => {
    expect(service).toBeTruthy();
  }));
});
