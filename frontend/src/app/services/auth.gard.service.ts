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


export class AuthGardService implements CanActivate{

  constructor(private authService : AuthService, private router : Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    return this.authService.user.pipe(take(1), map(user => {
      const isAuth = !!user //will return true if the user is authenticated
      if(isAuth){
        if(user?.roles.includes(route.data['role'])) return true;
        else if(user?.roles.includes('Admin')) return this.router.createUrlTree(['/appointments'])
        else if(user?.roles.includes('Doctor')) return this.router.createUrlTree(['/doctor-appointments/' + user?.doctor?.doctorId]);
        else if(user?.roles.includes('Patient')) return this.router.createUrlTree(['/patient-appointments/' + user?.patient?.patientId])
      }
      return this.router.createUrlTree(['/auth']);
    }))
  }
}
