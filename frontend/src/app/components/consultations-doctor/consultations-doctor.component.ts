import {Component, OnInit} from '@angular/core';
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {catchError, Observable, of} from 'rxjs';
import {PageRespone} from '../../model/page.response.model';
import {Consultation} from '../../model/consultation.model';
import {ActivatedRoute} from '@angular/router';
import {ConsultationsService} from '../../services/consultations.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-consultations-doctor',
  standalone: true,
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf,
    NgClass,
    DatePipe
  ],
  templateUrl: './consultations-doctor.component.html',
  styleUrl: './consultations-doctor.component.scss'
})
export class ConsultationsDoctorComponent implements OnInit{
  private doctorId!: number;
  pageConsultations$!: Observable<PageRespone<Consultation>>;
  currentPage: number = 0;
  pageSize: number = 5;
  errorMessage: string = '';
  selectedConsultation: Consultation | null = null;
  loadingDetails: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private consultationService: ConsultationsService,
    private modalService: NgbModal
  ) {}

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

  openDetailsModal(consultation: Consultation, modal: any) {
    this.loadingDetails = true;
    console.log('Opening details for consultation:', consultation);

    // Folosește direct consultația existentă fără să încerci să obții mai multe detalii
    setTimeout(() => {
      this.loadingDetails = false;
      this.selectedConsultation = this.consultationService.normalizeConsultationData(consultation);

      this.modalService.open(modal, {
        centered: true,
        size: 'lg'
      });
    }, 300);
  }
  // Metode helper pentru template
  hasContent(value: string | null | undefined): boolean {
    return !!value && value.trim().length > 0;
  }
}
