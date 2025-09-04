import { Routes } from '@angular/router';
import { CustomerLoginComponent } from './views/pages/customer-login/customer-login.component';
import { CustomerGuestGuard } from './guards/customer-guest.guard';
import { CustomerAuthGuard } from './guards/customer-auth.guard';
import { VerificationComponent } from './views/pages/verification/verification.component';
import { DashboardComponent } from './views/pages/dashboard/dashboard.component';
import { HomeLayoutComponent } from './views/partials/home-layout/home-layout.component';
import { ReferralComponent } from './views/pages/referrals/referral.component';

export const routes: Routes = [
  // Default redirect to customer login
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  
  // Customer Login (accessible only when not logged in)
  { 
    path: 'login', 
    component: CustomerLoginComponent,
    canActivate: [CustomerGuestGuard]
  },
  
  // OTP Verification (accessible only when not logged in)
  {
    path: 'verification',
    component: VerificationComponent,
    canActivate: [CustomerGuestGuard]
  },

  // Protected routes with layout
  {
    path: '',
    component: HomeLayoutComponent,
    canActivate: [CustomerAuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      }
    ]
  },

  // Referral management
  {
    path: 'referrals',
    component: ReferralComponent,
    canActivate: [CustomerAuthGuard]
    
  },

  // Wildcard route - redirect to login
  { path: '**', redirectTo: 'login' }
];