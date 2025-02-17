import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-hospitals',
  standalone: true,
  templateUrl: './hospitals.component.html',
  styleUrl: './hospitals.component.scss'
})
export class HospitalsComponent  implements OnInit{

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
