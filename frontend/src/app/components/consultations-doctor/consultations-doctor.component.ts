import {Component, OnInit} from '@angular/core';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {catchError, Observable, of} from 'rxjs';
import {PageRespone} from '../../model/page.response.model';
import {Consultation} from '../../model/consultation.model';
import {ActivatedRoute} from '@angular/router';
import {ConsultationsService} from '../../services/consultations.service';

@Component({
  selector: 'app-consultations-doctor',
  standalone: true,
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf,
    NgClass
  ],
  templateUrl: './consultations-doctor.component.html',
  styleUrl: './consultations-doctor.component.scss'
})
export class ConsultationsDoctorComponent implements OnInit{

  private doctorId!:number;
  pageConsultations$!: Observable<PageRespone<Consultation>>;
  currentPage:number=0;
  pageSize:number=5;
  errorMessage: string = '';

  constructor(private route: ActivatedRoute, private consultationService: ConsultationsService) {
  }

  ngOnInit(): void {
    this.doctorId = this.route.snapshot.params['id'];
    this.loadConsultations();
  }


  loadConsultations() {
    this.pageConsultations$ = this.consultationService.getConsultationsByDoctor(
      this.doctorId, this.currentPage, this.pageSize
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
}
