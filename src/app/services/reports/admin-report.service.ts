import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminReportService {
  private baseUrl = 'https://localhost:7270/api';

  constructor(private http: HttpClient) { }

  getOrganizationReport(organizationId: string): Observable<any> {
    return forkJoin({
      classPerformance: this.getClassPerformance(organizationId),
      dashboardStats: this.getDashboardStats(organizationId),
      attendance: this.getAttendanceStats(organizationId),
      assignments: this.getAssignmentStats(organizationId)
    }).pipe(
      map(data => ({
        generatedDate: new Date().toISOString(),
        organizationId: organizationId,
        totalStudents: data.dashboardStats?.totalStudents || 0,
        totalTeachers: data.dashboardStats?.totalTeachers || 0,
        totalStaff: data.dashboardStats?.totalStaff || 0,
        totalClasses: data.classPerformance?.length || 0,
        classPerformance: data.classPerformance || [],
        averageAttendance: data.attendance?.averageAttendance || 0,
        presentToday: data.attendance?.presentToday || 0,
        absentToday: data.attendance?.absentToday || 0,
        weeklyAttendance: data.attendance?.weeklyAttendance || 0,
        monthlyAttendance: data.attendance?.monthlyAttendance || 0,
        totalAssignments: data.assignments?.totalAssignments || 0,
        completedAssignments: data.assignments?.completedAssignments || 0,
        pendingAssignments: data.assignments?.pendingAssignments || 0,
        activeEvents: data.dashboardStats?.activeEvents || 0,
        overallPerformance: this.calculateOverallPerformance(data.classPerformance)
      }))
    );
  }

  private getClassPerformance(organizationId: string): Observable<any[]> {
    const url = `${this.baseUrl}/ClassPerformance/organizationPerformance/${organizationId}`;
    return this.http.get<any[]>(url);
  }

  private getDashboardStats(organizationId: string): Observable<any> {
    const url = `${this.baseUrl}/SchoolDashboards/adminDashboard/${organizationId}`;
    return this.http.get<any>(url);
  }

  private getAttendanceStats(organizationId: string): Observable<any> {
    // Use a simplified approach - get attendance data from a single teacher for now
    // This can be enhanced later to aggregate from all teachers
    const url = `${this.baseUrl}/Attendance/teacheDashboard/sample-teacher-id`;
    return this.http.get<any>(url).pipe(
      map((data: any) => {
        const monthlyData = data.monhtlyAttendance || [];
        const weeklyData = data.weeklyAttendance || [];
        const todayData = data.todayAttendance || [];

        let totalStudents = 0;
        let totalPresent = 0;
        let monthlyAvg = 0;
        let weeklyAvg = 0;

        // Calculate from monthly data
        if (monthlyData.length > 0) {
          monthlyData.forEach((month: any) => {
            totalStudents += month.TotalStudents || 0;
            totalPresent += month.TotalPresent || 0;
            monthlyAvg += month.AttendanceRate || 0;
          });
          monthlyAvg = monthlyAvg / monthlyData.length;
        }

        // Calculate from weekly data
        if (weeklyData.length > 0) {
          weeklyData.forEach((week: any) => {
            weeklyAvg += week.AttendanceRate || 0;
          });
          weeklyAvg = weeklyAvg / weeklyData.length;
        }

        const averageAttendance = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : Math.round(monthlyAvg);
        const todayPresent = todayData.reduce((sum: number, day: any) => sum + (day.TotalPresent || 0), 0);
        const todayTotal = todayData.reduce((sum: number, day: any) => sum + (day.TotalStudents || 0), 0);

        return {
          averageAttendance,
          presentToday: todayPresent,
          absentToday: Math.max(0, todayTotal - todayPresent),
          weeklyAttendance: Math.round(weeklyAvg) || averageAttendance,
          monthlyAttendance: Math.round(monthlyAvg) || averageAttendance
        };
      }),
      catchError(() => of({
        averageAttendance: 0,
        presentToday: 0,
        absentToday: 0,
        weeklyAttendance: 0,
        monthlyAttendance: 0
      }))
    );
  }

  private getAssignmentStats(organizationId: string): Observable<any> {
    // Placeholder - replace with actual assignment stats endpoint when available
    return of({
      totalAssignments: 0,
      completedAssignments: 0,
      pendingAssignments: 0
    });
  }

  private calculateOverallPerformance(classPerformance: any[]): number {
    if (!classPerformance || classPerformance.length === 0) return 0;
    const total = classPerformance.reduce((sum, c) => sum + (c.performancePercentage || 0), 0);
    return Math.round(total / classPerformance.length);
  }

  sendReportEmail(organizationId: string, email: string): Observable<any> {
    const url = `${this.baseUrl}/Reports/sendEmail`;
    return this.http.post(url, { organizationId, email });
  }
}