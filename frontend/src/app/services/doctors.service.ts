import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Doctor} from '../model/doctor.model';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {PageRespone} from '../model/page.response.model';
import {Specialization} from '../model/specialization.model';

@Injectable({
  providedIn: 'root'
})


export class DoctorsService {

  private specializationUrl = environment.backendHost + '/specializations';

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Obține token-ul la fiecare request
    return new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    });
  }
  public searchDoctors(keyword:String, currentPage:number, pageSize:number): Observable<PageRespone<Doctor>>{
    return this.http.get<PageRespone<Doctor>>(environment.backendHost + "/doctors?keyword=" + keyword + "&page=" + currentPage + "&size=" + pageSize)
  }

  public findAllDoctors(): Observable<Array<Doctor>> {
    return this.http.get<Array<Doctor>>(environment.backendHost + "/doctors/all")
  }

  public deleteDoctor(doctorId: number){
    return this.http.delete(environment.backendHost + "/doctors/" + doctorId)
  }

  public saveDoctor(doctor: any): Observable<any> {
    return this.http.post(environment.backendHost + "/doctors", doctor, {
      headers: new HttpHeaders({ "Content-Type": "application/json" }) //Aceasta asigură că Angular trimite corect Content-Type: application/json, la fel ca Postman.
    });
  }

  public updateDoctor(doctor: any, doctorId: number): Observable<any> {
    return this.http.put(`${environment.backendHost}/doctors/${doctorId}`, doctor);
  }

  public loadDoctorByEmail(email : string) : Observable<Doctor>{
    return this.http.get<Doctor>(environment.backendHost + "/doctors/find?email=" + email)
  }

  findAllSpecializations(): Observable<Array<Specialization>> {
    return this.http.get<Array<Specialization>>(`${this.specializationUrl}/all`);
  }

  findDoctorsBySpecialization(specializationId: number): Observable<Array<Doctor>> {
    return this.http.get<Array<Doctor>>(`${environment.backendHost}/doctors/specialization/${specializationId}`);
  }

  getFeaturedDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${environment.backendHost}/doctors/featured`, {
      headers: this.getHeaders() // Folosește metoda existentă pentru a adăuga token-ul de autorizare
    });
  }


}
