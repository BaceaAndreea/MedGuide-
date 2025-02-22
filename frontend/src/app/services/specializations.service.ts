import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Specialization} from '../model/specialization.model';
import {environment} from '../../environments/environment';
import {PageRespone} from '../model/page.response.model';

@Injectable({
  providedIn: 'root'
})
export class SpecializationsService {

  constructor(private http : HttpClient) { }

  public findAllSpecializations() : Observable<Array<Specialization>>{
    return this.http.get<Array<Specialization>>(environment.backendHost + "/specializations/all")
  }

  public searchSpecializations(keyword: string, currentPage: number, pageSize: number): Observable<PageRespone<Specialization>> {
    return this.http.get<PageRespone<Specialization>>(
      environment.backendHost + "/specializations/search?keyword=" + keyword + "&page=" + currentPage + "&size=" + pageSize
    );
  }


  public createSpecialization(specialization: any): Observable<any> {
    return this.http.post(environment.backendHost + "/specializations", specialization, {
      headers: new HttpHeaders({ "Content-Type": "application/json" }) //Aceasta asigură că Angular trimite corect Content-Type: application/json, la fel ca Postman.
    });
  }

  public updateSpecialization(specialization: any, specializationId: number): Observable<any> {
    return this.http.put(environment.backendHost + "/specializations/" + specializationId, specialization, {
      headers: new HttpHeaders({ "Content-Type": "application/json" })
    });
  }

  public deleteSpecialization(specializationId: number): Observable<void> {
    return this.http.delete<void>(environment.backendHost + "/specializations/" + specializationId);
  }

}
