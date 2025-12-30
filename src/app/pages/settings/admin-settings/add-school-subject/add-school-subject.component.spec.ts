import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSchoolSubjectComponent } from './add-school-subject.component';

describe('AddSchoolSubjectComponent', () => {
  let component: AddSchoolSubjectComponent;
  let fixture: ComponentFixture<AddSchoolSubjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSchoolSubjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSchoolSubjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
