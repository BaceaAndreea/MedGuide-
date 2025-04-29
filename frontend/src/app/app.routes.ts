import { Routes } from '@angular/router';
import {PatientsComponent} from './components/patients/patients.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {AppointmentsComponent} from './components/appointments/appointments.component';
import {DoctorsComponent} from './components/doctors/doctors.component';
import {HospitalsComponent} from './components/hospitals/hospitals.component';
import {SpecializationsComponent} from './components/specializations/specializations.component';
import {AppointmentsPatientComponent} from './components/appointments-patient/appointments-patient.component';
import {AppointmentsDoctorComponent} from './components/appointments-doctor/appointments-doctor.component';
import {ConsultationsPatientComponent} from './components/consultations-patient/consultations-patient.component';
import {ConsultationsDoctorComponent} from './components/consultations-doctor/consultations-doctor.component';
import {AuthenticationComponent} from './components/authentication/authentication.component';
import {AuthGardService} from './services/auth.gard.service';
import {DoctorPatientGuardService} from './services/doctor-patient.guard.service';
import {HomeComponent} from './components/home/home.component';
import {ChangePasswordComponent} from './components/change-password/change-password.component';
import {ForgotPasswordComponent} from './components/forgot-password/forgot-password.component';



export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'appointments', component: AppointmentsComponent, canActivate: [AuthGardService], data: {role : 'Admin'}},
  { path: 'patients', component: PatientsComponent, canActivate: [AuthGardService], data: {role : 'Admin'}},
  { path: 'doctors', component: DoctorsComponent, canActivate: [AuthGardService], data: {role : 'Admin'}},
  { path: 'hospitals', component: HospitalsComponent, canActivate: [AuthGardService], data: {role : 'Admin'}},
  { path: 'specializations', component: SpecializationsComponent, canActivate: [AuthGardService], data: {role : 'Admin'}},
  { path: 'patient-appointments/:id', component: AppointmentsPatientComponent, canActivate: [AuthGardService, DoctorPatientGuardService], data: {role : 'Patient'}},
  { path: 'doctor-appointments/:id', component: AppointmentsDoctorComponent, canActivate: [AuthGardService, DoctorPatientGuardService], data: {role : 'Doctor'}},
  { path: 'patient-consultations/:id', component: ConsultationsPatientComponent, canActivate: [AuthGardService, DoctorPatientGuardService], data: {role : 'Patient'}},
  { path: 'doctor-consultations/:id', component: ConsultationsDoctorComponent, canActivate: [AuthGardService, DoctorPatientGuardService], data: {role : 'Doctor'}},
  { path: 'auth', component: AuthenticationComponent},
  { path: 'navbar', component: NavbarComponent },
  { path: 'home', component: HomeComponent},
  { path: 'change-password', component: ChangePasswordComponent},
  { path: 'forgot-password', component: ForgotPasswordComponent}
];
