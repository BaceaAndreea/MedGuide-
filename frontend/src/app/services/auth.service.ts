import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LoginRequest, LoginResponse} from '../model/login.model';
import {BehaviorSubject, Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {JwtHelperService} from '@auth0/angular-jwt';
import {LoggedUser} from '../model/logged-user.model';
import {Router} from '@angular/router';
import {DoctorsService} from './doctors.service';
import {PatientsService} from './patients.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  jwtHelperService = new JwtHelperService();
  user = new BehaviorSubject<LoggedUser | null>(null);

  constructor(private http : HttpClient, private router : Router, private doctorService : DoctorsService,
              private patientService : PatientsService) {

  }

  public login(user : LoginRequest) : Observable<LoginResponse>{
    const formData = new FormData();
    formData.append('username', user.username);
    formData.append('password', user.password);
    return this.http.post<LoginResponse>(environment.backendHost+ "/login", formData)
  }

  saveToken(jwtTokens : LoginResponse){
    const decodedAccessToken = this.jwtHelperService.decodeToken(jwtTokens.accessToken);
    const loggedUser = new LoggedUser(decodedAccessToken.sub, decodedAccessToken.roles, jwtTokens.accessToken, this.getExpirationDate(decodedAccessToken.exp), undefined, undefined)
    this.user.next(loggedUser);
    console.log(" User set in authService:", loggedUser);
    this.redirectLoggedInUser(decodedAccessToken, jwtTokens.accessToken);

  }

  redirectLoggedInUser(decodedToken : any, accessToken : string){
    if(decodedToken.roles.includes("Admin")) this.router.navigateByUrl("/appointments");
    else if(decodedToken.roles.includes("Doctor"))
      this.doctorService.loadDoctorByEmail(decodedToken.sub).subscribe(doctor => {
        const loggedUser = new LoggedUser(decodedToken.sub, decodedToken.roles, accessToken, this.getExpirationDate(decodedToken.exp), undefined, doctor)
        this.user.next(loggedUser);
        this.router.navigateByUrl("/doctor-appointments/" + doctor.doctorId);

      })
    else if(decodedToken.roles.includes("Patient"))
      this.patientService.loadPatientByEmail(decodedToken.sub).subscribe(patient => {
        const loggedUser = new LoggedUser(decodedToken.sub, decodedToken.roles, accessToken, this.getExpirationDate(decodedToken.exp), patient, undefined)
        this.user.next(loggedUser);
        this.router.navigateByUrl("/patient-appointments/" + patient.patientId);

      })

  }

  getExpirationDate(exp : number){
    const date = new Date(0);
    date.setUTCSeconds(exp)
    return date;
  }
}
