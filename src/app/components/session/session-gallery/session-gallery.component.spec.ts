import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionGalleryComponent } from './session-gallery.component';

describe('SessionGalleryComponent', () => {
  let component: SessionGalleryComponent;
  let fixture: ComponentFixture<SessionGalleryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionGalleryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
