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
import {Patient} from '../model/patient.model';
import {Doctor} from '../model/doctor.model';
import {DropArgument} from 'node:net';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  jwtHelperService = new JwtHelperService();
  user = new BehaviorSubject<LoggedUser | null>(null);
  tokenExpirationTimer : any;

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
    this.autoLogout(this.getExpirationDate(decodedAccessToken.exp).valueOf() - new Date().valueOf())
    localStorage.setItem('userData', JSON.stringify(loggedUser));
    this.redirectLoggedInUser(decodedAccessToken, jwtTokens.accessToken);

  }

  redirectLoggedInUser(decodedToken : any, accessToken : string){
    if(decodedToken.roles.includes("Admin")) this.router.navigateByUrl("/appointments");
    else if(decodedToken.roles.includes("Doctor"))
      this.doctorService.loadDoctorByEmail(decodedToken.sub).subscribe(doctor => {
        const loggedUser = new LoggedUser(decodedToken.sub, decodedToken.roles, accessToken, this.getExpirationDate(decodedToken.exp), undefined, doctor)
        this.user.next(loggedUser);
        localStorage.setItem('userData', JSON.stringify(loggedUser));
        this.router.navigateByUrl("/doctor-appointments/" + doctor.doctorId);

      })
    else if(decodedToken.roles.includes("Patient"))
      this.patientService.loadPatientByEmail(decodedToken.sub).subscribe(patient => {
        const loggedUser = new LoggedUser(decodedToken.sub, decodedToken.roles, accessToken, this.getExpirationDate(decodedToken.exp), patient, undefined)
        this.user.next(loggedUser);
        localStorage.setItem('userData', JSON.stringify(loggedUser));
        this.router.navigateByUrl("/patient-appointments/" + patient.patientId);

      })

  }

  autoLogin() {
    // Verificăm dacă localStorage există
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return; // dacă e pe server (SSR), nu facem nimic
    }

    const userData: {
      username: string;
      roles: string[];
      _token: string;
      _expiration: Date;
      patient?: Patient;
      doctor?: Doctor;
    } = JSON.parse(localStorage.getItem('userData')!);
    if(!userData) return;
    const loadedUser = new LoggedUser(userData.username, userData.roles, userData._token, new Date(userData._expiration), userData.patient, userData.doctor);
    if(loadedUser.token) {
      this.user.next(loadedUser);
      this.autoLogout(loadedUser._expiration.valueOf()-new Date().valueOf())
    }
  }

  logout(){
    localStorage.clear();
    this.user.next(null);
    this.router.navigate(['/auth'])
    if(this.tokenExpirationTimer){
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;

  }

  getExpirationDate(exp : number){
    const date = new Date(0);
    date.setUTCSeconds(exp)
    return date;
  }

  autoLogout(expirationDuration : number){
    //when the accesss token is expired than we need to logout
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration)
  }

  refreshDoctor(doctor : Doctor){
    const userData : {
      username : string,
      roles : string[],
      _token : string,
      _expiration : Date,
      patient : Patient | undefined,
      doctor : Doctor | undefined
    } = JSON.parse(localStorage.getItem('userData')!);
    if(!userData) return;
    const loggedUser = new LoggedUser(userData.username, userData.roles, userData._token, new Date(userData._expiration), userData.patient, doctor);
    this.user.next(loggedUser);
    localStorage.setItem('userData', JSON.stringify(loggedUser));

  }

  refreshPatient(patient : Patient){
    const userData : {
      username : string,
      roles : string[],
      _token : string,
      _expiration : Date,
      patient : Patient | undefined,
      doctor : Doctor | undefined
    } = JSON.parse(localStorage.getItem('userData')!);
    if(!userData) return;
    const loggedUser = new LoggedUser(userData.username, userData.roles, userData._token, new Date(userData._expiration), patient, userData.doctor);
    if(loggedUser.token){
      this.user.next(loggedUser);
      localStorage.setItem('userData', JSON.stringify(loggedUser));
    }
  }
}
