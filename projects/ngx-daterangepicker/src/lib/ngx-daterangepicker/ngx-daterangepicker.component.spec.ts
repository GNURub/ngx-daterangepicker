import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxDateRangePickerComponent } from './ngx-daterangepicker.component';

describe('NgxDaterangepickerComponent', () => {
  let component: NgxDateRangePickerComponent;
  let fixture: ComponentFixture<NgxDateRangePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NgxDateRangePickerComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxDateRangePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
