import {
	TestBed,
	inject
} from '@angular/core/testing';

import {
	PatientCrudService
} from './patient-crud.service';

describe('PatientCrudService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [PatientCrudService]
		});
	});

	it('should be created', inject([PatientCrudService], (service: PatientCrudService) => {
		expect(service).toBeTruthy();
	}));
});
