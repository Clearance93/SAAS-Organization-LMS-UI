import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCourseStreamComponent } from './edit-course-stream.component';

describe('EditCourseStreamComponent', () => {
  let component: EditCourseStreamComponent;
  let fixture: ComponentFixture<EditCourseStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCourseStreamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCourseStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
