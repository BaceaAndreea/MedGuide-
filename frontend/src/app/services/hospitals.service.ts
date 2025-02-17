import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {Doctor} from '../model/doctor.model';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Hospital} from '../model/hospital.model';

@Injectable({
  providedIn: 'root'
})
export class HospitalsService {

  constructor(private http : HttpClient) { }

  public findAllHospitals() : Observable<Array<Hospital>>{
    return this.http.get<Array<Hospital>>(environment.backendHost + "/hospitals/all")
  }

}
