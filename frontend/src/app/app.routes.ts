import { Routes } from '@angular/router';
import {PatientsComponent} from './components/patients/patients.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {AppointmentsComponent} from './components/appointments/appointments.component';
import {DoctorsComponent} from './components/doctors/doctors.component';
import {HeaderComponent} from './components/header/header.component';
import {HospitalsComponent} from './components/hospitals/hospitals.component';
import {SpecializationsComponent} from './components/specializations/specializations.component';
import {AppointmentsPatientComponent} from './components/appointments-patient/appointments-patient.component';
import {AppointmentsDoctorComponent} from './components/appointments-doctor/appointments-doctor.component';
import {ConsultationsPatientComponent} from './components/consultations-patient/consultations-patient.component';
import {ConsultationsDoctorComponent} from './components/consultations-doctor/consultations-doctor.component';
import {AuthenticationComponent} from './components/authentication/authentication.component';


export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' }, // Redirecționare implicită
  { path: 'patients', component: PatientsComponent },
  { path: 'doctors', component: DoctorsComponent },
  { path: 'appointments', component: AppointmentsComponent },
  { path: 'hospitals', component: HospitalsComponent },
  { path: 'specializations', component: SpecializationsComponent },
  { path: 'navbar', component: NavbarComponent },
  { path: 'header', component: HeaderComponent},
  { path: 'patient-appointments/:id', component: AppointmentsPatientComponent},
  { path: 'doctor-appointments/:id', component: AppointmentsDoctorComponent},
  { path: 'patient-consultations/:id', component: ConsultationsPatientComponent},
  { path: 'doctor-consultations/:id', component: ConsultationsDoctorComponent},
  { path: 'auth', component: AuthenticationComponent}
];
