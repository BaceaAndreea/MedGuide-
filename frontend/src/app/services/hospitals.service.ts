import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {Doctor} from '../model/doctor.model';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Hospital} from '../model/hospital.model';
import {PageRespone} from '../model/page.response.model';

@Injectable({
  providedIn: 'root'
})
export class HospitalsService {

  constructor(private http : HttpClient) { }

  public searchHospitals(keyword: string, currentPage: number, pageSize: number): Observable<PageRespone<Hospital>> {
    return this.http.get<PageRespone<Hospital>>(
      environment.backendHost + "/hospitals/search/name?name=" + keyword + "&page=" + currentPage + "&size=" + pageSize
    );
  }


  public findAllHospitals() : Observable<Array<Hospital>>{
    return this.http.get<Array<Hospital>>(environment.backendHost + "/hospitals/all")
  }


  public createHospital(hospital: any): Observable<any> {
    return this.http.post(environment.backendHost + "/hospitals", hospital, {
      headers: new HttpHeaders({ "Content-Type": "application/json" }) //Aceasta asigură că Angular trimite corect Content-Type: application/json, la fel ca Postman.
    });
  }

  public updateHospital(hospital: any, hospitalId: number): Observable<any> {
    return this.http.put(environment.backendHost + "/hospitals/" + hospitalId, hospital, {
      headers: new HttpHeaders({ "Content-Type": "application/json" })
    });
  }


  public deleteHospital(hospitalId: number): Observable<void> {
    return this.http.delete<void>(environment.backendHost + "/hospitals/" + hospitalId);
  }

}
