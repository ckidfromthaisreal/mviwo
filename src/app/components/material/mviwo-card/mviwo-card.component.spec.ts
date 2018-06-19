import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MviwoCardComponent } from './mviwo-card.component';

describe('MviwoCardComponent', () => {
  let component: MviwoCardComponent;
  let fixture: ComponentFixture<MviwoCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MviwoCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MviwoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
