import {Component, OnInit} from '@angular/core';
import {RouterModule} from '@angular/router';
import {HeaderComponent} from './components/header/header.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {ReactiveFormsModule} from '@angular/forms';
import {AuthService} from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [RouterModule, HeaderComponent, NavbarComponent, ReactiveFormsModule]
})
export class AppComponent implements OnInit{
  title = 'frontend';

  constructor(private authService : AuthService) {
  }

  ngOnInit(): void {
    this.authService.autoLogin()

  }


}
