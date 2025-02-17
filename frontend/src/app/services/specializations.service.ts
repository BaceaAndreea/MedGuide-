import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Specialization} from '../model/specialization.model';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpecializationsService {

  constructor(private http : HttpClient) { }

  public findAllSpecializations() : Observable<Array<Specialization>>{
    return this.http.get<Array<Specialization>>(environment.backendHost + "/specializations/all")
  }
}
