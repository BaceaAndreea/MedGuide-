import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Patient} from '../model/patient.model';
import {environment} from '../../environments/environment';
import {PageRespone} from '../model/page.response.model';
import {Appointment} from '../model/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class PatientsService {
  //Funcționează perfect în standalone: true, fără a fi nevoie să declari explicit providerii în fiecare componentă.
  // Nu este afectată de ordinea de inițializare, deoarece injectarea se face doar când este necesară.
  // Este mai flexibilă și permite folosirea serviciilor în afara constructorului (ex: în variabile statice sau în funcții).
  private http = inject(HttpClient);

  constructor() {
    console.log('PatientsService initialized!');
    console.trace('PatientsService stack trace');
  }


  public searchPatients(keyword: string, currentPage: number, pageSize: number): Observable<PageRespone<Patient>> {
    return this.http.get<PageRespone<Patient>>(
      `${environment.backendHost}/patients?keyword=${keyword}&page=${currentPage}&size=${pageSize}`
    );
  }

  public findAllPatients() : Observable<Array<Patient>>{
    return this.http.get<Array<Patient>>(environment.backendHost + "/patients/all")
  }

  public deletePatient(patientId: number) {
    return this.http.delete<void>(environment.backendHost + "/patients/" + patientId);
  }


  public savePatient(patient: Partial<Patient>): Observable<any> {
    return this.http.post<Patient>(environment.backendHost + "/patients", patient, {
      headers: new HttpHeaders({ "Content-Type": "application/json" })
    });
  }


  updatePatient(patient: Patient, id: number): Observable<any> {
    return this.http.put<Patient>(`${environment.backendHost}/patients/${id}`, patient, {
      headers: new HttpHeaders({ "Content-Type": "application/json" })
    });
  }

  public getNoAppointmentsByPatientId(patientId: number, page: number, size: number): Observable<PageRespone<Appointment>> {
    return this.http.get<PageRespone<Appointment>>(
      `${environment.backendHost}/patients/${patientId}/other-appointments?page=${page}&size=${size}`
    );
  }

}
