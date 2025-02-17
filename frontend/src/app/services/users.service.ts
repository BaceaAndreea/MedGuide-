import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http : HttpClient) { }
  public checkIfEmailExist(email:string) : Observable<boolean>
  {
    return this.http.get<boolean>(environment.backendHost + "/users?email=" + email);
  }
}
