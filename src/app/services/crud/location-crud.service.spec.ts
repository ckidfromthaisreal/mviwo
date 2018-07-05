import {
	TestBed,
	inject
} from '@angular/core/testing';

import {
	LocationCrudService
} from './location-crud.service';

describe('LocationCrudService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [LocationCrudService]
		});
	});

	it('should be created', inject([LocationCrudService], (service: LocationCrudService) => {
		expect(service).toBeTruthy();
	}));
});
