import {
	TestBed,
	inject
} from '@angular/core/testing';

import {
	ArraysService
} from './arrays.service';

describe('ArrayService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ArraysService]
		});
	});

	it('should be created', inject([ArraysService], (service: ArraysService) => {
		expect(service).toBeTruthy();
	}));
});
