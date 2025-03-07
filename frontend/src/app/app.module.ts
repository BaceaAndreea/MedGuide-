import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {HttpClient, provideHttpClient} from '@angular/common/http'; // Noua metodă pentru HttpClient

import { AppComponent } from './app.component';
import {PatientsComponent} from './components/patients/patients.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {AppointmentsComponent} from './components/appointments/appointments.component';
import {DoctorsComponent} from './components/doctors/doctors.component';
import {ConsultationsComponent} from './components/consultations/consultations.component';
import {HeaderComponent} from './components/header/header.component';
import {HospitalsComponent} from './components/hospitals/hospitals.component';
import {SpecializationsComponent} from './components/specializations/specializations.component';
import { routes } from './app.routes';


@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),


  ],
  providers: [
    provideHttpClient(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
