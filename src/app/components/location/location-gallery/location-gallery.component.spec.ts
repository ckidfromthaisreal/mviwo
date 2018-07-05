import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationGalleryComponent } from './location-gallery.component';

describe('LocationGalleryComponent', () => {
  let component: LocationGalleryComponent;
  let fixture: ComponentFixture<LocationGalleryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationGalleryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
