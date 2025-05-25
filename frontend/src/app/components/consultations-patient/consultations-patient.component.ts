// consultations-patient.component.ts - Părțile modificate
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {catchError, Observable, of, tap} from 'rxjs';
import {PageRespone} from '../../model/page.response.model';
import {Consultation} from '../../model/consultation.model';
import {ConsultationsService} from '../../services/consultations.service';
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-consultations-patient',
  standalone: true,
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf,
    NgClass,
    DatePipe,
    TranslateModule,
    ReactiveFormsModule
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

  // Rating form
  ratingForm: FormGroup;
  ratingSubmitted = false;
  ratingSuccess = false;
  ratingError = false;

  constructor(
    private route: ActivatedRoute,
    private consultationService: ConsultationsService,
    private modalService: NgbModal,
    private translate: TranslateService,
    private fb: FormBuilder
  ) {
    // Initialize language settings
    this.translate.setDefaultLang('ro');

    // Initialize rating form with 1-5 scale
    this.ratingForm = this.fb.group({
      rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]], // Schimbat la 1-5
      reviewComment: ['', Validators.maxLength(500)]
    });
  }

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
      }),
      catchError(error => {
        console.error("Error fetching consultations:", error);
        this.errorMessage = this.translate.instant('ERROR.FETCH_CONSULTATIONS');
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
    console.log('Opening details modal for consultation:', consultation);

    // Load the complete consultation from backend
    this.consultationService.getConsultationById(consultation.consultationId).subscribe({
      next: (fullConsultation) => {
        console.log('Loaded full consultation details:', fullConsultation);

        // Set the complete consultation with all details
        this.selectedConsultation = fullConsultation;

        // Open modal
        this.modalService.open(modal, {
          centered: true,
          backdrop: 'static',
          size: 'lg'
        });
      },
      error: (err) => {
        console.error('Error loading consultation details:', err);

        // In case of error, use what we already have, but complete missing fields
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
          symptoms: consultation.symptoms || this.translate.instant('CONSULTATIONS.NO_SYMPTOMS'),
          recommendations: consultation.recommendations || this.translate.instant('CONSULTATIONS.NO_RECOMMENDATIONS'),
          prescriptions: consultation.prescriptions || this.translate.instant('CONSULTATIONS.NO_PRESCRIPTIONS'),
          rating: consultation.rating,
          reviewComment: consultation.reviewComment,
          reviewDate: consultation.reviewDate,
          isReviewed: consultation.isReviewed
        };

        // Open modal anyway with whatever info we have
        this.modalService.open(modal, {
          centered: true,
          backdrop: 'static',
          size: 'lg'
        });
      }
    });
  }

  openReviewModal(consultation: Consultation, modal: any) {
    console.log('Opening review modal for consultation:', consultation);

    // Reset form and status flags
    this.ratingForm.reset();
    this.ratingSubmitted = false;
    this.ratingSuccess = false;
    this.ratingError = false;

    // Load the complete consultation from backend
    this.consultationService.getConsultationById(consultation.consultationId).subscribe({
      next: (fullConsultation) => {
        console.log('Loaded full consultation details for review:', fullConsultation);

        // Set the complete consultation with all details
        this.selectedConsultation = fullConsultation;

        // Open modal
        this.modalService.open(modal, {
          centered: true,
          backdrop: 'static',
          size: 'md'
        });
      },
      error: (err) => {
        console.error('Error loading consultation details for review:', err);

        // In case of error, use what we already have
        this.selectedConsultation = {
          ...consultation,
          rating: consultation.rating,
          reviewComment: consultation.reviewComment,
          reviewDate: consultation.reviewDate,
          isReviewed: consultation.isReviewed
        };

        // Open modal anyway with whatever info we have
        this.modalService.open(modal, {
          centered: true,
          backdrop: 'static',
          size: 'md'
        });
      }
    });
  }

  // Check if a field exists and is not empty
  hasValue(value: string | null | undefined): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  // Submit rating
  submitRating() {
    this.ratingSubmitted = true;

    if (this.ratingForm.invalid || !this.selectedConsultation) {
      return;
    }

    const ratingData = {
      consultationId: this.selectedConsultation.consultationId,
      rating: this.ratingForm.value.rating,
      reviewComment: this.ratingForm.value.reviewComment
    };

    this.consultationService.addRating(this.selectedConsultation.consultationId, ratingData)
      .subscribe({
        next: (response) => {
          console.log('Rating submitted successfully:', response);
          this.ratingSuccess = true;
          this.ratingError = false;

          // Update the selected consultation with the new rating data
          if (this.selectedConsultation) {
            this.selectedConsultation = {
              ...this.selectedConsultation,
              rating: ratingData.rating,
              reviewComment: ratingData.reviewComment,
              reviewDate: new Date().toISOString(),
              isReviewed: true
            };
          }

          // Reload consultations to refresh the list
          this.loadConsultations();
        },
        error: (error) => {
          console.error('Error submitting rating:', error);
          this.ratingSuccess = false;
          this.ratingError = true;
        }
      });
  }

  // Get stars array for display (1-5 scale)
  getStarsArray(rating: number | undefined | null): number[] {
    const safeRating = Math.max(0, Math.min(5, rating || 0)); // Asigură-te că e între 0-5
    return Array(safeRating).fill(0);
  }

  // Get empty stars array for display (1-5 scale)
  getEmptyStarsArray(rating: number | undefined | null): number[] {
    const safeRating = Math.max(0, Math.min(5, rating || 0)); // Asigură-te că e între 0-5
    return Array(5 - safeRating).fill(0); // 5 stele total minus cele pline
  }
}
