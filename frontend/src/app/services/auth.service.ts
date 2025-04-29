import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LoginRequest, LoginResponse} from '../model/login.model';
import {BehaviorSubject, map, Observable, tap} from 'rxjs';
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

  public login(user: LoginRequest): Observable<LoginResponse> {
    const formData = new FormData();
    formData.append('username', user.username);
    formData.append('password', user.password);

    return this.http.post<LoginResponse>(environment.backendHost + "/login", formData)
      .pipe(
        map(resp => ({
          ...resp,
          passwordTemporary: resp.passwordTemporary === true   // true doar dacă vine explicit
        }))
      );

  }

  saveToken(jwtTokens: LoginResponse) {
    const decodedAccessToken = this.jwtHelperService.decodeToken(jwtTokens.accessToken);

    // Create the logged user with appropriate temporary password flag
    const loggedUser = new LoggedUser(
      decodedAccessToken.sub,
      decodedAccessToken.roles,
      jwtTokens.accessToken,
      this.getExpirationDate(decodedAccessToken.exp),
      undefined,
      undefined,
      jwtTokens.passwordTemporary || false  // Make sure to pass the flag
    );

    // Update user state and set auto-logout
    this.user.next(loggedUser);
    this.autoLogout(this.getExpirationDate(decodedAccessToken.exp).valueOf() - new Date().valueOf());

    // Save to localStorage - this is crucial for persistence
    localStorage.setItem('userData', JSON.stringify(loggedUser));

    console.log('Login response:', jwtTokens); // Debug: Check the actual response
    console.log('Password temporary:', jwtTokens.passwordTemporary); // Debug: Check the flag

    // Determine where to navigate based on password status
    if (jwtTokens.passwordTemporary) {
      console.log('Navigating to change password due to temporary password');
      // Either initialize the change password form in the authentication component
      // OR navigate to the dedicated change password component
      this.router.navigate(['/change-password'], {
        queryParams: {
          email: decodedAccessToken.sub,
          isTemporary: 'true'
        }
      });
    } else {
      console.log('Proceeding with normal login flow');
      this.redirectLoggedInUser(decodedAccessToken, jwtTokens.accessToken);
    }
  }

  redirectLoggedInUser(decodedToken: any, accessToken: string) {
    // Check if the user has admin role
    if (decodedToken.roles.includes("Admin")) {
      this.router.navigateByUrl("/appointments");
    }
    // Check if the user has doctor role
    else if (decodedToken.roles.includes("Doctor")) {
      this.doctorService.loadDoctorByEmail(decodedToken.sub).subscribe(doctor => {
        // Get existing user data to preserve the passwordTemporary flag
        const existingUserData = JSON.parse(localStorage.getItem('userData') || '{}');
        const passwordTemp = existingUserData.passwordTemporary || false;

        // Create updated user object with doctor info but preserve temporary password status
        const loggedUser = new LoggedUser(
          decodedToken.sub,
          decodedToken.roles,
          accessToken,
          this.getExpirationDate(decodedToken.exp),
          undefined,
          doctor,
          passwordTemp // Make sure to keep the original passwordTemporary flag
        );

        this.user.next(loggedUser);
        localStorage.setItem('userData', JSON.stringify(loggedUser));
        this.router.navigateByUrl("/doctor-appointments/" + doctor.doctorId);
      });
    }
    // Check if the user has patient role
    else if (decodedToken.roles.includes("Patient")) {
      this.patientService.loadPatientByEmail(decodedToken.sub).subscribe(patient => {
        // Get existing user data to preserve the passwordTemporary flag
        const existingUserData = JSON.parse(localStorage.getItem('userData') || '{}');
        const passwordTemp = existingUserData.passwordTemporary || false;

        // Create updated user object with patient info but preserve temporary password status
        const loggedUser = new LoggedUser(
          decodedToken.sub,
          decodedToken.roles,
          accessToken,
          this.getExpirationDate(decodedToken.exp),
          patient,
          undefined,
          passwordTemp // Make sure to keep the original passwordTemporary flag
        );

        this.user.next(loggedUser);
        localStorage.setItem('userData', JSON.stringify(loggedUser));
        this.router.navigateByUrl("/patient-appointments/" + patient.patientId);
      });
    }
  }

  autoLogin() {
    // Check if localStorage exists (SSR check)
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return; // Skip if running on server
    }

    // Get user data from localStorage
    const userDataStr = localStorage.getItem('userData');
    if (!userDataStr) return;

    try {
      const userData: {
        username: string;
        roles: string[];
        _token: string;
        _expiration: string | Date; // Could be stored as string
        patient?: any;
        doctor?: any;
        passwordTemporary?: boolean; // Add this flag to the type
      } = JSON.parse(userDataStr);

      if (!userData) return;

      // Convert string date to Date object if needed
      const expirationDate = userData._expiration instanceof Date
        ? userData._expiration
        : new Date(userData._expiration);

      // Create LoggedUser with all properties
      const loadedUser = new LoggedUser(
        userData.username,
        userData.roles,
        userData._token,
        expirationDate,
        userData.patient,
        userData.doctor,
        userData.passwordTemporary || false // Include the password temporary flag
      );

      // Check if token is still valid
      if (loadedUser.token) {
        this.user.next(loadedUser);

        // Calculate remaining time for auto logout
        const expirationDuration = expirationDate.valueOf() - new Date().valueOf();
        this.autoLogout(expirationDuration);

        console.log('Auto login successful, password temporary:', loadedUser.passwordTemporary);

        // If user has temporary password and isn't already on change password page
        // redirect them there
        if (loadedUser.passwordTemporary && !window.location.href.includes('/change-password')) {
          console.log('Redirecting to change password page due to temporary password');
          this.router.navigate(['/change-password'], {
            queryParams: {
              email: loadedUser.username,
              isTemporary: 'true'
            }
          });
        }
      }
    } catch (error) {
      console.error('Error during auto login:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('userData');
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

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(environment.backendHost + "/auth/send-temporary-password", {
      email: email
    });
  }

  changePassword(email: string, oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post<any>(environment.backendHost + "/auth/change-password", {
      email: email,
      oldPassword: oldPassword,
      newPassword: newPassword
    });
  }

// Add this method to check if user has a temporary password
  hasTemporaryPassword(): boolean {
    const userData = JSON.parse(localStorage.getItem('userData')!);
    return userData?.passwordTemporary === true;
  }


}
