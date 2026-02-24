import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent implements OnInit {
  assignments: any[] = [];
  grades: any[] = [];
  announcements: any[] = [];

  constructor() {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // TODO: Implement data fetching logic
    this.assignments = [
      { title: 'Math Homework', dueDate: '2024-06-15', status: 'Pending' },
      { title: 'Science Project', dueDate: '2024-06-20', status: 'In Progress' }
    ];

    this.grades = [
      { subject: 'Mathematics', grade: 'A', percentage: 92 },
      { subject: 'English', grade: 'B+', percentage: 87 }
    ];

    this.announcements = [
      { title: 'Upcoming Parent-Teacher Meeting', date: '2024-06-25' },
      { title: 'Sports Day Registration', date: '2024-07-01' }
    ];
  }
}
