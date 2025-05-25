import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {catchError, Observable, tap, throwError} from 'rxjs';
import {PageRespone} from '../model/page.response.model';
import {Appointment} from '../model/appointment.model';
import {AppointmentsComponent} from '../components/appointments/appointments.component';

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {

  private http = inject(HttpClient);

  constructor() {

  }
  public searchAppointments(keyword: string, currentPage: number, pageSize: number): Observable<PageRespone<Appointment>> {
    return this.http.get<PageRespone<Appointment>>(`${environment.backendHost}/appointments`, {
      params: {keyword, page: currentPage.toString(), size: pageSize.toString()}
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
    console.log('Saving appointment:', appointment); // Add this for debugging

    return this.http.post(environment.backendHost + '/appointments', appointment, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    }).pipe(
      tap(response => console.log('Save appointment response:', response)), // Add this for debugging
      catchError(error => {
        console.error('Save appointment error:', error);
        return throwError(() => error);
      })
    );
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

  getAppointmentById(appointmentId: number): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/appointments/${appointmentId}`);
  }

  completeAppointment(id: number, appointmentData?: any): Observable<any> {
    console.log(`Completing appointment ${id}`);

    // Dacă nu avem date despre programare, trimitem doar statusul
    const data = appointmentData || { status: 'COMPLETED' };

    return this.http.patch<any>(`${environment.backendHost}/appointments/${id}/complete`, data)
      .pipe(
        tap(response => console.log('Appointment completion response:', response)),
        catchError(error => {
          console.error(`Error completing appointment ${id}:`, error);

          // Ultimă încercare - folosim doar endpoint-ul de bază cu o cerere simplificată
          if (error.status === 403 || error.status === 404) {
            console.log('Final attempt with simplified payload');
            const minimalData = {
              appointmentId: id,
              status: 'COMPLETED'
            };
            return this.http.put<any>(`${environment.backendHost}/appointments/${id}`, minimalData);
          }

          throw error;
        })
      );
  }

  public getAvailableTimeSlots(doctorId: number, date: string): Observable<string[]> {
    console.log('Calling getAvailableTimeSlots with:', { doctorId, date }); // Debug

    return this.http.get<string[]>(`${environment.backendHost}/appointments/available-slots`, {
      params: {
        doctorId: doctorId.toString(),
        date: date // Format: 'yyyy-MM-dd'
      }
    }).pipe(
      catchError(error => {
        console.error('Error fetching available time slots:', error);
        return throwError(() => error);
      })
    );
  }

}
