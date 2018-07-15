import {
	async,
	ComponentFixture,
	TestBed
} from '@angular/core/testing';

import {
	RecordGalleryComponent
} from './record-gallery.component';

describe('RecordGalleryComponent', () => {
	let component: RecordGalleryComponent;
	let fixture: ComponentFixture < RecordGalleryComponent > ;

	beforeEach(async (() => {
		TestBed.configureTestingModule({
				declarations: [RecordGalleryComponent]
			})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(RecordGalleryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
