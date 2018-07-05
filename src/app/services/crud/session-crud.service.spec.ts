import {
	TestBed,
	inject
} from '@angular/core/testing';

import {
	SessionCrudService
} from './session-crud.service';

describe('SessionCrudService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [SessionCrudService]
		});
	});

	it('should be created', inject([SessionCrudService], (service: SessionCrudService) => {
		expect(service).toBeTruthy();
	}));
});
