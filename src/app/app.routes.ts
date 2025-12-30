import { Routes } from '@angular/router';
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
import { AddGradeModalComponent } from './pages/modals/add-grade-modal/add-grade-modal.component';
import { AddCourseStreamComponent } from './pages/settings/admin-settings/add-course-stream/add-course-stream.component';
import { EditCourseStreamComponent } from './pages/settings/admin-settings/edit-course-stream/edit-course-stream.component';
import { DetailsComponent } from './pages/settings/admin-settings/details/details.component';
import { AddSchoolSubjectComponent } from './pages/settings/admin-settings/add-school-subject/add-school-subject.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'organization-setup', component: OrganizationSetupComponent },
    { path: 'registration-payment', component: RegistrationPaymentComponent },
    { path: 'netcash-payment', component: NetcashPaymentComponent },
    { path: 'thank-you', component: ThankYouComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', loadComponent: () => import('./pages/authPage/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
    { path: 'confirm-email', loadComponent: () => import('./pages/authPage/confirm-email/confirm-email.component').then(m => m.ConfirmEmailComponent) },
    { path: 'school-admin-dashboard', component: SchoolAdminDashboardComponent },
    { path: 'add-teacher', component: AddTeacherComponent },
    { path: 'add-guest', component: AddGuestComponent },
    { path: 'add-learner', component: AddLearnerComponent },
    { path: 'add-student', component: AddStudentComponent },
    { path: 'add-stuff-member', component: AddStuffMemberComponent },
    { path: 'admin-profile-modal', component: AdminProfileModalComponent },
    { path: 'edit-admin-profile', component: EditAdminProfileComponent },
    { path: 'admin-settings', component: AdminSettingsComponent },
    { path: 'add-grade-modal', component: AddGradeModalComponent },
    { path: 'add-course-stream', component: AddCourseStreamComponent },
    { path: 'edit-course-stream', component: EditCourseStreamComponent },
    { path: 'details', component: DetailsComponent },
    { path: 'add-school-subject', component: AddSchoolSubjectComponent },
    { path: 'communication-center', loadComponent: () => import('./pages/communication/communication-center.component').then(m => m.CommunicationCenterComponent) },
    { path: '**', redirectTo: 'login' } // Wildcard route should always be last
];