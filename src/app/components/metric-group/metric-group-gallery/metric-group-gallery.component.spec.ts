import {
	async,
	ComponentFixture,
	TestBed
} from '@angular/core/testing';

import {
	MetricGroupGalleryComponent
} from './metric-group-gallery.component';

describe('MetricGroupGalleryComponent', () => {
	let component: MetricGroupGalleryComponent;
	let fixture: ComponentFixture < MetricGroupGalleryComponent > ;

	beforeEach(async (() => {
		TestBed.configureTestingModule({
				declarations: [MetricGroupGalleryComponent]
			})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MetricGroupGalleryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
