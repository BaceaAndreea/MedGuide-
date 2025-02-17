import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Patient} from '../model/patient.model';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PatientsService {

  constructor(private http:HttpClient) { }

  public findAllPatients() : Observable<Array<Patient>>{
    return this.http.get<Array<Patient>>(environment.backendHost + "/patients/all")
  }
}
