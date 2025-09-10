import { Routes } from '@angular/router';
import { CustomerLoginComponent } from './views/pages/customer-login/customer-login.component';
import { CustomerGuestGuard } from './guards/customer-guest.guard';
import { CustomerAuthGuard } from './guards/customer-auth.guard';
import { VerificationComponent } from './views/pages/verification/verification.component';
import { DashboardComponent } from './views/pages/dashboard/dashboard.component';
import { HomeLayoutComponent } from './views/partials/home-layout/home-layout.component';
import { ReferralsComponent } from './views/pages/referrals/referrals.component';
import { TyfcbslipComponent } from './views/pages/tyfcbslip/tyfcbslip.component';
import { GratitudeComponent } from './views/pages/gratitude/gratitude.component';
import { GrowthMeetComponent } from './views/pages/growth-meet/growth-meet.component';
import { EventComponent } from './views/pages/event/event.component';
import { AttendanceComponent } from './views/pages/attendance/attendance.component';

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
      },
      {
        path: 'referrals',
        component: ReferralsComponent
      },
      {
        path: 'tyfcbslip',
        component: TyfcbslipComponent
      },
      {
        path: 'gratitude',
        component: GratitudeComponent
      },
      {
        path: 'growth-meet',
        component: GrowthMeetComponent
      },
      {
        path: 'event',
        component: EventComponent
      },
      {
        path: 'attendance',
        component: AttendanceComponent
      }
    ]
  },

  // Wildcard route - redirect to login
  { path: '**', redirectTo: 'login' }
];
  