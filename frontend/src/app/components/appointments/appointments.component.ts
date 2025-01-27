import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss'
})
export class AppointmentsComponent implements OnInit{

  constructor() { }

  ngOnInit(): void {
  }

  showModal: boolean = false;

  // Deschide modalul
  openModal(): void {
    this.showModal = true;
  }

  // Închide modalul
  closeModal(): void {
    this.showModal = false;
  }

}
