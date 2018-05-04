import {
	async,
	ComponentFixture,
	TestBed
} from '@angular/core/testing';

import {
	MviwoSnackbarComponent
} from './mviwo-snackbar.component';

describe('MviwoSnackbarComponent', () => {
	let component: MviwoSnackbarComponent;
	let fixture: ComponentFixture < MviwoSnackbarComponent > ;

	beforeEach(async (() => {
		TestBed.configureTestingModule({
				declarations: [MviwoSnackbarComponent]
			})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MviwoSnackbarComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
