import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MviwoListSelectComponent } from './mviwo-list-select.component';

describe('MviwoListSelectComponent', () => {
  let component: MviwoListSelectComponent;
  let fixture: ComponentFixture<MviwoListSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MviwoListSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MviwoListSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
