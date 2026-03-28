import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { OrganizationSetupComponent } from './pages/organization-setup/organization-setup.component';
import { LoginComponent } from './pages/authPage/login/login.component';
import { RegisterComponent } from './pages/authPage/register/register.component';
import { ThankYouComponent } from './pages/authPage/thank-you/thank-you.component';
import { RegistrationPaymentComponent } from './pages/payment/registration-payment/registration-payment.component';
import { NetcashPaymentComponent } from './pages/netcash-payment/netcash-payment.component';
import { ForgotPasswordComponent } from './pages/authPage/forgot-password/forgot-password.component';
import { SchoolAdminDashboardComponent } from './pages/dashboards/school-admin-dashboard/school-admin-dashboard.component';
import { AddTeacherComponent } from './pages/dashboards/teachers/add-teacher/add-teacher.component';
import { AddGuestComponent } from './pages/schools/guests/add-guest/add-guest.component';
import { AddLearnerComponent } from './pages/schools/learners/add-learner/add-learner.component';
import { AddStudentComponent } from './pages/schools/students/add-student/add-student.component';
import { AddStuffMemberComponent } from './pages/schools/stuff-members/add-stuff-member/add-stuff-member.component';
import { AdminProfileModalComponent } from './pages/schools/modals/admin-profile-modal/admin-profile-modal.component';
import { ConfirmEmailComponent } from './pages/authPage/confirm-email/confirm-email.component';
import { EditAdminProfileComponent } from './pages/schools/admin/edit-admin-profile/edit-admin-profile.component';
import { AdminSettingsComponent } from './pages/settings/admin-settings/admin-settings.component';
import { LibraryComponent } from './pages/library/library.component';
import { AddGradeModalComponent } from './pages/modals/add-grade-modal/add-grade-modal.component';
import { AddCourseStreamComponent } from './pages/settings/admin-settings/add-course-stream/add-course-stream.component';
import { EditCourseStreamComponent } from './pages/settings/admin-settings/edit-course-stream/edit-course-stream.component';
import { DetailsComponent } from './pages/settings/admin-settings/details/details.component';
import { AddSchoolSubjectComponent } from './pages/settings/admin-settings/add-school-subject/add-school-subject.component';
import { TeacherDashboardComponent } from './pages/dashboards/teacher-dashboard/teacher-dashboard.component';
import { TeacherSettingsComponent } from './pages/settings/teacher-settings/teacher-settings.component';
import { StudentDashboardComponent } from './pages/dashboards/student-dashboard/student-dashboard.component';
import { StudentSettingsComponent } from './pages/settings/student-settings/student-settings.component';
import { CommunicationCenterComponent } from './pages/communication/communication-center.component';
import { AdminReportComponent } from './pages/reports/admin-report/admin-report.component';
import { TeacherReportComponent } from './pages/reports/teacher-report/teacher-report.component';
import { TrainingProgramsComponent } from './pages/training/training-programs.component';
import { CertificationsComponent } from './pages/certifications/certifications.component';
import { ScheduleWorkshopComponent } from './pages/workshops/schedule-workshop.component';
import { JoinWorkshopComponent } from './pages/workshops/join-workshop.component';
import { ManageCoursesComponent } from './pages/courses/manage-courses.component';
import { FaithProgramsComponent } from './pages/faith/faith-programs.component';
import { ComplianceReportsComponent } from './pages/compliance/compliance-reports.component';
import { StaffDevelopmentComponent } from './pages/training/staff-development.component';
import { LeadershipTrainingComponent } from './pages/training/leadership-training.component';
import { ParentDashboardComponent } from './pages/dashboards/parent-dashboard/parent-dashboard.component';
import { ParentSettingsComponent } from './pages/settings/parent-settings/parent-settings.component';
import { ChurchAdminDashboardComponent } from './pages/dashboards/church-admin-dashboard/church-admin-dashboard.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', loadComponent: () => import('./pages/authPage/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
    { path: 'confirm-email', loadComponent: () => import('./pages/authPage/confirm-email/confirm-email.component').then(m => m.ConfirmEmailComponent) },
    { path: 'organization-setup', component: OrganizationSetupComponent },
    { path: 'registration-payment', component: RegistrationPaymentComponent, canActivate: [authGuard] },
    { path: 'netcash-payment', component: NetcashPaymentComponent, canActivate: [authGuard] },
    { path: 'thank-you', component: ThankYouComponent },
    { path: 'school-admin-dashboard', component: SchoolAdminDashboardComponent, canActivate: [authGuard] },
    { path: 'add-teacher', component: AddTeacherComponent, canActivate: [authGuard] },
    { path: 'add-guest', component: AddGuestComponent, canActivate: [authGuard] },
    { path: 'add-learner', component: AddLearnerComponent, canActivate: [authGuard] },
    { path: 'add-student', component: AddStudentComponent, canActivate: [authGuard] },
    { path: 'add-stuff-member', component: AddStuffMemberComponent, canActivate: [authGuard] },
    { path: 'admin-profile-modal', component: AdminProfileModalComponent, canActivate: [authGuard] },
    { path: 'edit-admin-profile', component: EditAdminProfileComponent, canActivate: [authGuard] },
    { path: 'admin-settings', component: AdminSettingsComponent, canActivate: [authGuard] },
    { path: 'library', component: LibraryComponent, canActivate: [authGuard] },
    { path: 'add-grade-modal', component: AddGradeModalComponent, canActivate: [authGuard] },
    { path: 'add-course-stream', component: AddCourseStreamComponent, canActivate: [authGuard] },
    { path: 'edit-course-stream', component: EditCourseStreamComponent, canActivate: [authGuard] },
    { path: 'details', component: DetailsComponent, canActivate: [authGuard] },
    { path: 'add-school-subject', component: AddSchoolSubjectComponent, canActivate: [authGuard] },
    { path: "teacher-dashboard", component: TeacherDashboardComponent, canActivate: [authGuard] },
    { path: "teacher-settings", component: TeacherSettingsComponent, canActivate: [authGuard] },
    { path: "student-dashboard", component: StudentDashboardComponent, canActivate: [authGuard] },
    { path: "student-settings", component: StudentSettingsComponent, canActivate: [authGuard] },
    { path: "communication-center", component: CommunicationCenterComponent, canActivate: [authGuard] },
    { path: "generate-report", component: AdminReportComponent, canActivate: [authGuard] },
    { path: "teacher-report", component: TeacherReportComponent, canActivate: [authGuard] },
    { path: "training-programs", component: TrainingProgramsComponent, canActivate: [authGuard] },
    { path: "certifications", component: CertificationsComponent, canActivate: [authGuard] },
    { path: "schedule-workshop", component: ScheduleWorkshopComponent, canActivate: [authGuard] },
    { path: "join-workshop", component: JoinWorkshopComponent, canActivate: [authGuard] },
    { path: "manage-courses", component: ManageCoursesComponent, canActivate: [authGuard] },
    { path: "faith-programs", component: FaithProgramsComponent, canActivate: [authGuard] },
    { path: "compliance-reports", component: ComplianceReportsComponent, canActivate: [authGuard] },
    { path: "staff-development", component: StaffDevelopmentComponent, canActivate: [authGuard] },
    { path: "leadership-training", component: LeadershipTrainingComponent, canActivate: [authGuard] },
    { path: "parent-dashboard", component: ParentDashboardComponent, canActivate: [authGuard] },
    { path: "parent-settings", component: ParentSettingsComponent, canActivate: [authGuard] },
    { path: "church-admin-dashboard", component: ChurchAdminDashboardComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: 'login' }
];