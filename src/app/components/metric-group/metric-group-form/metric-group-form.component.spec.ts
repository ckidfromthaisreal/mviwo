import {
	async,
	ComponentFixture,
	TestBed
} from '@angular/core/testing';

import {
	MetricGroupFormComponent
} from './metric-group-form.component';

describe('MetricGroupFormComponent', () => {
	let component: MetricGroupFormComponent;
	let fixture: ComponentFixture < MetricGroupFormComponent > ;

	beforeEach(async (() => {
		TestBed.configureTestingModule({
				declarations: [MetricGroupFormComponent]
			})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MetricGroupFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
