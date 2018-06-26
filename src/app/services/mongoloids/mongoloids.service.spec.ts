import {
	TestBed,
	inject
} from '@angular/core/testing';

import {
	MongoloidsService
} from './mongoloids.service';

describe('MongoloidsService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [MongoloidsService]
		});
	});

	it('should be created', inject([MongoloidsService], (service: MongoloidsService) => {
		expect(service).toBeTruthy();
	}));
});
