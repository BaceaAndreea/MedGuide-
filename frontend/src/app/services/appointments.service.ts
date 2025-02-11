import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {catchError, Observable, throwError} from 'rxjs';
import {PageRespone} from '../model/page.response.model';
import {Appointment} from '../model/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {

  constructor(private http: HttpClient) { }

  // public searchAppointments(keyword:string, currentPage:number, pageSize:number) : Observable<PageRespone<Appointment>>{
  //   return this.http.get<PageRespone<Appointment>>(environment.backendHost + "/appointments?keyword=" + keyword + "&page=" + currentPage + "&size=" + pageSize)
  // }
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
}
