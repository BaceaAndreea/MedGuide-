import {Component, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {Subscription} from 'rxjs';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  imports: [
    RouterLink,
    NgIf
  ],
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  userSub!: Subscription;
  isAuthenticated = false;

  constructor(private authService : AuthService) { }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(loggedUser => {
      this.isAuthenticated = !!loggedUser; //will return true if the user existed and is logged in
    })
  }

  logout() {

  }
}
