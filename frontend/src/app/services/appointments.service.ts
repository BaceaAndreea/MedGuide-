import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {catchError, Observable, throwError} from 'rxjs';
import {PageRespone} from '../model/page.response.model';
import {Appointment} from '../model/appointment.model';
import {AppointmentsComponent} from '../components/appointments/appointments.component';

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {

  private http = inject(HttpClient);

  constructor() {
    console.log('AppointmentsService initialized!');
    console.log('HttpClient in AppointmentsService:', this.http);
  }
  public searchAppointments(keyword: string, currentPage: number, pageSize: number): Observable<PageRespone<Appointment>> {
    return this.http.get<PageRespone<Appointment>>(`${environment.backendHost}/appointments`, {
      params: {
        keyword,
        page: currentPage.toString(),
        size: pageSize.toString()
      }
    }).pipe(
      catchError(error => {
        console.error('API Error:', error);
        return throwError(() => error);
      })
    );
  }

  public deleteAppointment(appointmentId : number){
    return this.http.delete(environment.backendHost + "/appointments/" + appointmentId);
  }

  public saveAppointment(appointment: any): Observable<any> {
    return this.http.post(environment.backendHost + "/appointments", appointment, {
      headers: new HttpHeaders({ "Content-Type": "application/json" }) //Aceasta asigură că Angular trimite corect Content-Type: application/json, la fel ca Postman.
    });
  }
  public updateAppointment(appointment: any, appointmentId: number): Observable<any> {
    return this.http.put(environment.backendHost + "/appointments/" + appointmentId, appointment, {
      headers: new HttpHeaders({ "Content-Type": "application/json" })
    });
  }

  public getAppointmentByDoctor(doctorId:number, currentPage:number, pageSize:number): Observable<PageRespone<Appointment>>{
    return this.http.get<PageRespone<Appointment>>(
      `${environment.backendHost}/doctors/${doctorId}/appointments?page=${currentPage}&size=${pageSize}`
  );
  }

  public getAppointmentsByPatient(patientId: number, page: number, size: number): Observable<PageRespone<Appointment>> {
    return this.http.get<PageRespone<Appointment>>(
      `${environment.backendHost}/patients/${patientId}/appointments?page=${page}&size=${size}`
    );
  }

}
