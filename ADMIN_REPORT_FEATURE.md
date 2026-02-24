# Admin Report Generation Feature

## Overview
A comprehensive report generation system for school administrators to view, download, and email detailed performance reports.

## Features Implemented

### 1. Report Page (`/generate-report`)
- Accessible from school admin dashboard via "Generate Report" quick action
- Displays comprehensive school performance data
- Real-time data loading with loading indicators

### 2. Data Sources
The report aggregates data from multiple API endpoints:

#### Primary Endpoint:
- **Class Performance**: `GET https://localhost:7270/api/ClassPerformance/organizationPerformance/{organizationId}`
  - Returns class-level performance data with percentages

#### Additional Endpoints (integrated):
- **Dashboard Stats**: `GET https://localhost:7270/api/SchoolDashboards/adminDashboard/{organizationId}`
  - Total students, teachers, staff, admins, guests
  
#### Placeholder Endpoints (to be implemented on backend):
- **Attendance Stats**: For daily, weekly, monthly attendance data
- **Assignment Stats**: For assignment completion metrics
- **Email Service**: `POST https://localhost:7270/api/Reports/sendEmail`

### 3. Report Sections

#### Overview Statistics
- Total Students
- Total Teachers
- Staff Members
- Active Classes
- Average Attendance
- Overall Performance

#### Class Performance Breakdown
- Table view with all classes
- Performance percentage with visual progress bars
- Status badges (Excellent, Good, Average, Needs Improvement)
- Color-coded based on performance levels:
  - Excellent: ≥80% (Green)
  - Good: 60-79% (Blue)
  - Average: 40-59% (Yellow)
  - Needs Improvement: <40% (Red)

#### Attendance Summary
- Present Today
- Absent Today
- Weekly Average
- Monthly Average

#### Additional Metrics
- Total Assignments
- Completed Assignments
- Pending Assignments
- Active Events

### 4. Export Features

#### Download Report
- Generates HTML file with complete report
- Includes styling for professional appearance
- Filename format: `{OrganizationName}_Report_{Date}.html`
- Can be opened in any browser or converted to PDF

#### Send via Email
- Prompts for recipient email address
- Sends formatted report to specified email
- Success/error notifications

### 5. UI/UX Features
- Responsive design for all screen sizes
- Loading states with spinner
- Error handling with user-friendly messages
- Back to dashboard navigation
- Gradient stat cards for visual appeal
- Hover effects and smooth transitions

## File Structure
```
src/app/
├── pages/
│   └── reports/
│       └── admin-report/
│           ├── admin-report.component.ts
│           ├── admin-report.component.html
│           └── admin-report.component.css
├── services/
│   └── reports/
│       └── admin-report.service.ts
└── app.routes.ts (updated)
```

## Usage

### For Administrators:
1. Navigate to School Admin Dashboard
2. Click "Generate Report" in Quick Actions
3. View comprehensive report data
4. Click "Download Report" to save locally
5. Click "Send via Email" to email the report

### API Integration Notes:
The service uses `forkJoin` to combine multiple API calls into a single report object. Additional endpoints can be easily added by:
1. Adding the endpoint method in `admin-report.service.ts`
2. Including it in the `forkJoin` call
3. Mapping the response data in the report object

## Backend Requirements

### Recommended Additional Endpoints:

1. **Attendance Statistics**
   ```
   GET /api/Attendance/organizationStats/{organizationId}
   Response: {
     averageAttendance: number,
     presentToday: number,
     absentToday: number,
     weeklyAttendance: number,
     monthlyAttendance: number
   }
   ```

2. **Assignment Statistics**
   ```
   GET /api/Assignment/organizationStats/{organizationId}
   Response: {
     totalAssignments: number,
     completedAssignments: number,
     pendingAssignments: number
   }
   ```

3. **Email Report Service**
   ```
   POST /api/Reports/sendEmail
   Body: {
     organizationId: string,
     email: string
   }
   ```

## Future Enhancements
- Date range filtering
- Report type selection (summary vs detailed)
- PDF generation on backend
- Scheduled report emails
- Comparison with previous periods
- Export to Excel/CSV
- Print-friendly view
- Chart visualizations
