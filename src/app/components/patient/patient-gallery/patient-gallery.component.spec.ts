import {
	async,
	ComponentFixture,
	TestBed
} from '@angular/core/testing';

import {
	PatientGalleryComponent
} from './patient-gallery.component';

describe('PatientGalleryComponent', () => {
	let component: PatientGalleryComponent;
	let fixture: ComponentFixture < PatientGalleryComponent > ;

	beforeEach(async (() => {
		TestBed.configureTestingModule({
				declarations: [PatientGalleryComponent]
			})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PatientGalleryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
