import { Routes } from '@angular/router';
import {PatientsComponent} from './components/patients/patients.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {AppointmentsComponent} from './components/appointments/appointments.component';
import {DoctorsComponent} from './components/doctors/doctors.component';
import {ConsultationsComponent} from './components/consultations/consultations.component';
import {HeaderComponent} from './components/header/header.component';
import {HospitalsComponent} from './components/hospitals/hospitals.component';
import {SpecializationsComponent} from './components/specializations/specializations.component';


export const routes: Routes = [
  { path: '', redirectTo: '/patients', pathMatch: 'full' }, // Redirecționare implicită
  { path: 'patients', component: PatientsComponent },
  { path: 'doctors', component: DoctorsComponent },
  { path: 'appointments', component: AppointmentsComponent },
  { path: 'consultations', component: ConsultationsComponent },
  { path: 'hospitals', component: HospitalsComponent },
  { path: 'specializations', component: SpecializationsComponent },
  { path: 'navbar', component: NavbarComponent },
  { path: 'header', component: HeaderComponent}
];
