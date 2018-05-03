import {
	async,
	ComponentFixture,
	TestBed
} from '@angular/core/testing';

import {
	MetricGalleryComponent
} from './metric-gallery.component';

describe('MetricGalleryComponent', () => {
	let component: MetricGalleryComponent;
	let fixture: ComponentFixture < MetricGalleryComponent > ;

	beforeEach(async (() => {
		TestBed.configureTestingModule({
				declarations: [MetricGalleryComponent]
			})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MetricGalleryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
