import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-patients',
  standalone: true,
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.scss'
})
export class PatientsComponent implements OnInit{

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
