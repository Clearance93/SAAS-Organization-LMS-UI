import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStuffMemberComponent } from './add-stuff-member.component';

describe('AddStuffMemberComponent', () => {
  let component: AddStuffMemberComponent;
  let fixture: ComponentFixture<AddStuffMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddStuffMemberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddStuffMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
