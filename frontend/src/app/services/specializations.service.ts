import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
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

  public createSpecialization(specialization: Specialization): Observable<Specialization> {
    return this.http.post<Specialization>(environment.backendHost + "/specializations", specialization);
  }

  public updateSpecialization(specializationId: number, specialization: Specialization): Observable<Specialization> {
    return this.http.put<Specialization>(environment.backendHost + "/specializations/" + specializationId, specialization);
  }

  public deleteSpecialization(specializationId: number): Observable<void> {
    return this.http.delete<void>(environment.backendHost + "/specializations/" + specializationId);
  }

}
