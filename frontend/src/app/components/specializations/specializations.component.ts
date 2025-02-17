import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-specializations',
  standalone: true,
  templateUrl: './specializations.component.html',
  styleUrl: './specializations.component.scss'
})
export class SpecializationsComponent implements OnInit{

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
