import { Component } from '@angular/core';

@Component({
  selector: 'app-doctors',
  standalone: true,
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.scss']
})
export class DoctorsComponent {
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
