import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import {AuthService} from './auth.service';
import {map, take} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DoctorPatientGuardService implements CanActivate{

  constructor(private authService : AuthService, private router : Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    return this.authService.user.pipe(take(1), map(user => {
      if(user?.roles.includes('Doctor') && Number(route.params['id']) !== user?.doctor?.doctorId){
        return this.router.createUrlTree(['/doctor-appointments/'+ user?.doctor?.doctorId])
      } else if(user?.roles.includes('Patient') && Number(route.params['id']) !== user?.patient?.patientId){
        return this.router.createUrlTree(['/patient-appointments/'+user?.patient?.patientId])
      }
      return true;
    }))
  }
}
