// consultations-patient.component.ts
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {catchError, Observable, of, tap} from 'rxjs';
import {PageRespone} from '../../model/page.response.model';
import {Consultation} from '../../model/consultation.model';
import {ConsultationsService} from '../../services/consultations.service';
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-consultations-patient',
  standalone: true,
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf,
    NgClass,
    DatePipe
  ],
  templateUrl: './consultations-patient.component.html',
  styleUrl: './consultations-patient.component.scss'
})
export class ConsultationsPatientComponent implements OnInit {

  private patientId!: number;
  pageConsultations$!: Observable<PageRespone<Consultation>>;
  currentPage: number = 0;
  pageSize: number = 5;
  errorMessage: string = '';
  selectedConsultation: Consultation | null = null;

  constructor(
    private route: ActivatedRoute,
    private consultationService: ConsultationsService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.params['id'];
    this.loadConsultations();
  }

  loadConsultations() {
    this.pageConsultations$ = this.consultationService.getConsultationsByPatient(
      this.patientId, this.currentPage, this.pageSize
    ).pipe(
      tap(response => {
        console.log('Loaded consultations:', response);

        // Verifică dacă toate câmpurile necesare sunt prezente
        if (response.content && response.content.length > 0) {
          response.content.forEach(consultation => {
            console.log('Consultation details:', {
              id: consultation.consultationId,
              symptoms: consultation.symptoms,
              recommendations: consultation.recommendations,
              prescriptions: consultation.prescriptions
            });
          });
        }
      }),
      catchError(error => {
        console.error("Error fetching consultations:", error);
        this.errorMessage = "Nu s-au putut încărca consultațiile.";
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
    console.log('Opening modal for consultation:', consultation);

    // În loc să creăm o copie, încărcăm consultația completă din backend
    this.consultationService.getConsultationById(consultation.consultationId).subscribe({
      next: (fullConsultation) => {
        console.log('Loaded full consultation details:', fullConsultation);

        // Setăm consultația completă cu toate detaliile
        this.selectedConsultation = fullConsultation;

        // Deschidem modalul
        this.modalService.open(modal, {
          centered: true,
          backdrop: 'static',
          size: 'lg'
        });
      },
      error: (err) => {
        console.error('Error loading consultation details:', err);

        // În caz de eroare, folosim ce avem deja, dar completăm câmpurile lipsă
        this.selectedConsultation = {
          consultationId: consultation.consultationId,
          diagnosis: consultation.diagnosis || '',
          appointmentId: consultation.appointmentId,
          appointmentDate: consultation.appointmentDate,
          doctorId: consultation.doctorId,
          doctorFirstName: consultation.doctorFirstName || '',
          doctorLastName: consultation.doctorLastName || '',
          patientId: consultation.patientId,
          patientFirstName: consultation.patientFirstName || '',
          patientLastName: consultation.patientLastName || '',
          hospitalAddress: consultation.hospitalAddress || '',
          symptoms: consultation.symptoms || 'Informație indisponibilă',
          recommendations: consultation.recommendations || 'Informație indisponibilă',
          prescriptions: consultation.prescriptions || 'Informație indisponibilă'
        };

        // Deschidem modalul oricum, cu ce informații avem
        this.modalService.open(modal, {
          centered: true,
          backdrop: 'static',
          size: 'lg'
        });
      }
    });
  }

  // Verifică dacă un câmp există și nu este gol
  hasValue(value: string | null | undefined): boolean {
    return value !== null && value !== undefined && value !== '';
  }
}

