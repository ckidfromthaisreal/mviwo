import { TestBed, inject } from '@angular/core/testing';

import { MetricGroupCrudService } from './metric-group-crud.service';

describe('MetricGroupCrudService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MetricGroupCrudService]
    });
  });

  it('should be created', inject([MetricGroupCrudService], (service: MetricGroupCrudService) => {
    expect(service).toBeTruthy();
  }));
});
