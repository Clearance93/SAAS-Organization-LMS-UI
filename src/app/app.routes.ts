import { Routes } from '@angular/router';
import { OrganizationSetupComponent } from './pages/organization-setup/organization-setup.component';
import { LoginComponent } from './pages/authPage/login/login.component';
import { RegisterComponent } from './pages/authPage/register/register.component';
import { ThankYouComponent } from './pages/authPage/thank-you/thank-you.component';
import { RegistrationPaymentComponent } from './pages/payment/registration-payment/registration-payment.component';
import { NetcashPaymentComponent } from './pages/netcash-payment/netcash-payment.component';
import { ForgotPasswordComponent } from './pages/authPage/forgot-password/forgot-password.component';

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
    { path: '**', redirectTo: 'login' }
];
