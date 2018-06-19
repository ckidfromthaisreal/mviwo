import {
	TestBed,
	inject
} from '@angular/core/testing';

import {
	MetricCrudService
} from './metric-crud.service';

describe('MetricCrudService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [MetricCrudService]
		});
	});

	it('should be created', inject([MetricCrudService], (service: MetricCrudService) => {
		expect(service).toBeTruthy();
	}));
});
