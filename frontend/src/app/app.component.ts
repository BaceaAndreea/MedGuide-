import {Component, OnInit} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {HeaderComponent} from './components/header/header.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {ReactiveFormsModule} from '@angular/forms';
import {AuthService} from './services/auth.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [RouterModule, HeaderComponent, NavbarComponent, ReactiveFormsModule, NgIf]
})
export class AppComponent implements OnInit{

  title = 'frontend';
  showNavbar = true;
  constructor(private authService : AuthService, private router : Router) {
    this.router.events.subscribe(() => {
      // Listează rutele unde vrei să ascunzi sidebar-ul
      const hiddenRoutes = [ '/home', '/auth', '/signup'];
      this.showNavbar = !hiddenRoutes.includes(this.router.url);
    });
  }

  ngOnInit(): void {
    this.authService.autoLogin()
  }

}
