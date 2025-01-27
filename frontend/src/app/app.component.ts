import { Component } from '@angular/core';
import {RouterModule} from '@angular/router';
import {HeaderComponent} from './components/header/header.component';
import {NavbarComponent} from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [RouterModule, HeaderComponent, NavbarComponent]
})
export class AppComponent {
  title = 'frontend';
}
