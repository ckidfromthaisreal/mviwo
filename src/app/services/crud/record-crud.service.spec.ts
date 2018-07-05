import {
	TestBed,
	inject
} from '@angular/core/testing';

import {
	RecordCrudService
} from './record-crud.service';

describe('RecordCrudService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [RecordCrudService]
		});
	});

	it('should be created', inject([RecordCrudService], (service: RecordCrudService) => {
		expect(service).toBeTruthy();
	}));
});
