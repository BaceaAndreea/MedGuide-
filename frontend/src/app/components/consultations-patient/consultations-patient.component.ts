import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {catchError, Observable, of} from 'rxjs';
import {PageRespone} from '../../model/page.response.model';
import {Consultation} from '../../model/consultation.model';
import {ConsultationsService} from '../../services/consultations.service';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {Appointment} from '../../model/appointment.model';

@Component({
  selector: 'app-consultations-patient',
  standalone: true,
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf,
    NgClass
  ],
  templateUrl: './consultations-patient.component.html',
  styleUrl: './consultations-patient.component.scss'
})
export class ConsultationsPatientComponent implements OnInit{

  private patientId!:number;
  pageConsultations$!: Observable<PageRespone<Consultation>>;
  currentPage:number=0;
  pageSize:number=5;
  errorMessage: string = '';

  constructor(private route: ActivatedRoute, private consultationService: ConsultationsService) {
  }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.params['id'];
    this.loadConsultations();
  }


  loadConsultations() {
    this.pageConsultations$ = this.consultationService.getConsultationsByPatient(
      this.patientId, this.currentPage, this.pageSize
    ).pipe(
      catchError(error => {
        console.error("Error fetching consultations:", error);
        this.errorMessage = "Failed to load consultations.";
        return of({
          content: [],
          totalPages: 0,
          number: this.currentPage,
          size: this.pageSize,
          totalElements: 0
        });
      })
    );
  }


  gotoPage(page: number) {
    this.currentPage = page;
    this.loadConsultations();
  }

  viewDetails(consultation: Consultation) {
    alert(`Diagnosis: ${consultation.diagnosis}`);
  }

}
