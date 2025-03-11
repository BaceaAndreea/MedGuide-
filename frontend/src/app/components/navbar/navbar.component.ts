import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {Subscription} from 'rxjs';
import {AuthService} from '../../services/auth.service';
import {LoggedUser} from '../../model/logged-user.model';
import {log} from 'node:util';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgIf
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit , OnDestroy {
  userSub!:Subscription;
  isAuthenticated = false;
  isAdmin = false;
  isDoctor = false;
  isPatient = false;
  doctorId : number | undefined;
  patientId : number | undefined;

  constructor(private authService : AuthService) { }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe( data => {
      this.isAuthenticated = !!data;
      if(!this.isAuthenticated){
        this.initializeState();
      }else if(!!data)
        this.setRole(data);
    })
  }

  setRole(loggedUser : LoggedUser | null){
    if(loggedUser?.roles.includes("Admin")) this.isAdmin = true
    else if(!!loggedUser?.doctor){
      this.isDoctor = true;
      this.doctorId = loggedUser.doctor?.doctorId;
    }
    else if (!!loggedUser?.patient){
      this.isPatient = true;
      this.patientId = loggedUser.patient?.patientId;
    }

  }

  initializeState() {
    this.isAdmin = false;
    this.isDoctor = false;
    this.isPatient = false;
  }


  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}
