import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-consultations',
  standalone: true,
  imports: [],
  templateUrl: './consultations.component.html',
  styleUrl: './consultations.component.scss'
})
export class ConsultationsComponent implements OnInit{

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
