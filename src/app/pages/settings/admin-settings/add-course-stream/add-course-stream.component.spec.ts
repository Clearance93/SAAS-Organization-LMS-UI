import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCourseStreamComponent } from './add-course-stream.component';

describe('AddCourseStreamComponent', () => {
  let component: AddCourseStreamComponent;
  let fixture: ComponentFixture<AddCourseStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCourseStreamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCourseStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
