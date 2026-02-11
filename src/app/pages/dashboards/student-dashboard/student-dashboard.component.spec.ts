import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentDashboardComponent } from './student-dashboard.component';

describe('StudentDashboardComponent', () => {
  let component: StudentDashboardComponent;
  let fixture: ComponentFixture<StudentDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDashboardComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(StudentDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', () => {
    component.ngOnInit();
    expect(component.assignments.length).toBeGreaterThan(0);
    expect(component.grades.length).toBeGreaterThan(0);
    expect(component.announcements.length).toBeGreaterThan(0);
  });
});
