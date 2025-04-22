import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AsyncPipe, CommonModule, NgForOf, NgIf} from '@angular/common';
import {AppointmentsService} from '../../services/appointments.service';
import {catchError, filter, map, Observable, take, throwError} from 'rxjs';
import {PageRespone} from '../../model/page.response.model';
import {Appointment} from '../../model/appointment.model';
import {DoctorsService} from '../../services/doctors.service';
import {Doctor} from '../../model/doctor.model';
import {NgbModal, NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {PatientsService} from '../../services/patients.service';
import {Patient} from '../../model/patient.model';
import {AuthService} from '../../services/auth.service';
import { futureDateValidator} from '../../validators/date-validator';
import {TranslateModule, TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    AsyncPipe,
    NgForOf,
    CommonModule,
    NgbModalModule,
    TranslateModule

  ],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss'
})
export class AppointmentsComponent implements OnInit{
  searchFormGroup!: FormGroup;
  appointmentFormGroup!: FormGroup;
  updateAppointmentFormGroup!: FormGroup;
  //$ - indica faptul că variabila este un Observable.
  pageAppointment$!: Observable<PageRespone<Appointment>>;
  doctors$!: Observable<Array<Doctor>>;
  patients$!: Observable<Array<Patient>>;
  currentPage: number = 0;
  pageSize: number = 5;
  errorMessage!: string;
  errorMessageDoctor!: string;
  errorMessagePatient!: string;
  submitted: boolean = false;
  defaultDoctor!: Doctor;
  defaultPatient!: Patient;
  totalAppointments: number = 0;
  completedAppointments: number = 0;
  canceledAppointments: number = 0;
  upcomingAppointments: number = 0;

  // Minimum date for new appointments (current date)
  minDate: string = new Date().toISOString().slice(0, 16);

  private appointmentService = inject(AppointmentsService);

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private doctorService: DoctorsService,
    private patientService: PatientsService,
    private authService: AuthService,
    protected translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword: this.fb.control('')
    });

    this.appointmentFormGroup = this.fb.group({
      appointmentDate: [null, [Validators.required, futureDateValidator()]],
      doctor: [null, Validators.required],
      patient: [null, Validators.required],
      reason: ["", Validators.required]
      // Nu mai avem nevoie de câmpul de status deoarece îl vom seta automat
    });

    // Wait until user != null in BehaviorSubject
    this.authService.user
      .pipe(
        filter(u => !!u), // Only pass when user is not null
        take(1)           // Stop after first valid user
      )
      .subscribe(() => {
        this.handleSearchAppointments();
      });
  }

  openModal(content: any) {
    this.submitted = false;
    this.fetchDoctors();
    this.fetchPatients();
    this.modalService.open(content, { size: 'lg', backdrop: 'static' });
  }

  handleSearchAppointments() {
    const keyword = this.searchFormGroup.get('keyword')?.value || '';
    this.pageAppointment$ = this.appointmentService.searchAppointments(keyword, this.currentPage, this.pageSize).pipe(
      map(response => {
        // Reset counters
        this.totalAppointments = response.totalElements || 0;
        this.upcomingAppointments = 0;
        this.completedAppointments = 0;
        this.canceledAppointments = 0;

        // Calculate appointment statistics
        const currentDate = new Date();

        if (response.content) {
          response.content.forEach(appointment => {
            const appointmentDate = new Date(appointment.appointmentDate);
            const status = appointment.status?.toLowerCase() || '';

            // Check status for categorizing
            if (status.includes('finalizat') || status.includes('complet') ||
              status.includes('abgeschlossen') || status.includes('completed')) {
              this.completedAppointments++;
            } else if (status.includes('anul') || status.includes('cancel') ||
              status.includes('stornier')) {
              this.canceledAppointments++;
            } else if (appointmentDate > currentDate) {
              // If appointment date is in the future and not canceled/completed
              this.upcomingAppointments++;
            }

            // Determinăm cheia de traducere potrivită pentru fiecare status
            let statusKey = '';
            if (status.includes('finalizat') || status.includes('complet') ||
              status.includes('abgeschlossen') || status.includes('completed')) {
              statusKey = 'STATUS.COMPLETED';
            } else if (status.includes('anul') || status.includes('cancel') ||
              status.includes('stornier')) {
              statusKey = 'STATUS.CANCELED';
            } else if (status.includes('program') || status.includes('schedul') ||
              status.includes('geplant')) {
              statusKey = 'STATUS.SCHEDULED';
            } else if (status.includes('confirm') || status.includes('bestätigt')) {
              statusKey = 'STATUS.CONFIRMED';
            }

            // Aplicăm traducerea dacă am găsit o potrivire
            if (statusKey) {
              appointment.status = this.translateService.instant(statusKey);
            }
          });
        }

        return response;
      }),
      catchError(err => {
        this.errorMessage = err.message;
        return throwError(() => err);
      })
    );
  }

  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchAppointments();
  }

  handleDeleteAppointment(a: Appointment) {
    let conf = confirm(this.translateService.instant('CONFIRMATION.DELETE_APPOINTMENT'));
    if (!conf) return;

    // În loc să ștergem programarea, actualizăm statusul la "Anulată"
    const cancelledAppointment = {
      appointmentId: a.appointmentId,
      appointmentDate: a.appointmentDate,
      status: this.translateService.instant('STATUS.CANCELED'), // Status setat la anulată
      reason: a.reason,
      doctor: { doctorId: a.doctor?.doctorId },
      patient: { patientId: a.patient?.patientId }
    };

    this.appointmentService.updateAppointment(cancelledAppointment, cancelledAppointment.appointmentId).subscribe({
      next: () => {
        alert(this.translateService.instant('SUCCESS.APPOINTMENT_CANCELLED'));
        this.handleSearchAppointments();
      },
      error: err => {
        alert(this.translateService.instant('ERROR.CANCEL_APPOINTMENT') + ": " + err.message);
        console.log(err);
      }
    });
  }

  fetchDoctors() {
    this.doctors$ = this.doctorService.findAllDoctors().pipe(
      catchError(err => {
        this.errorMessageDoctor = err.message;
        return throwError(err);
      })
    );
  }

  fetchPatients() {
    this.patients$ = this.patientService.findAllPatients().pipe(
      catchError(err => {
        this.errorMessagePatient = err.message;
        return throwError(err);
      })
    );
  }

  onCloseModel(modal: any) {
    modal.close();
    this.appointmentFormGroup.reset();
  }

  onSaveAppointment(modal: any) {
    this.submitted = true;

    if (this.appointmentFormGroup.invalid) return;

    const appointmentDateISO = new Date(this.appointmentFormGroup.value.appointmentDate).toISOString();

    const appointment = {
      appointmentDate: appointmentDateISO,
      status: this.translateService.instant('STATUS.SCHEDULED'),
      reason: this.appointmentFormGroup.value.reason,
      doctor: { doctorId: this.appointmentFormGroup.value.doctor?.doctorId },
      patient: { patientId: this.appointmentFormGroup.value.patient?.patientId }
    };

    this.appointmentService.saveAppointment(appointment).subscribe({
      next: () => {
        alert(this.translateService.instant('SUCCESS.APPOINTMENT_CREATED'));
        this.handleSearchAppointments();
        this.appointmentFormGroup.reset();
        this.submitted = false;
        modal.close();
      },
      error: err => {
        alert(this.translateService.instant('ERROR.SAVE_APPOINTMENT') + ": " + err.message);
        console.error(err);
      }
    });
  }

  getUpdateModal(a: any, updateContent: any) {
    this.fetchDoctors();
    this.fetchPatients();
    this.updateAppointmentFormGroup = this.fb.group({
      appointmentId: [a.appointmentId, Validators.required],
      appointmentDate: [a.appointmentDate, [Validators.required, futureDateValidator()]],
      appointmentStatus: [a.status, Validators.required],
      doctor: [a.doctor, Validators.required],
      patient: [a.patient, Validators.required],
      reason: [a.reason, Validators.required]
    });

    this.defaultDoctor = this.updateAppointmentFormGroup.controls['doctor'].value;
    this.defaultPatient = this.updateAppointmentFormGroup.controls['patient'].value;
    this.modalService.open(updateContent, { size: 'lg' });
  }

  onUpdateAppointment(updateModal: any) {
    this.submitted = true;
    if (this.updateAppointmentFormGroup.invalid) return;

    const appointment = {
      appointmentId: this.updateAppointmentFormGroup.value.appointmentId,
      appointmentDate: this.updateAppointmentFormGroup.value.appointmentDate,
      status: this.updateAppointmentFormGroup.value.appointmentStatus,
      reason: this.updateAppointmentFormGroup.value.reason,
      doctor: { doctorId: this.updateAppointmentFormGroup.value.doctor?.doctorId },
      patient: { patientId: this.updateAppointmentFormGroup.value.patient?.patientId }
    };

    this.appointmentService.updateAppointment(appointment, appointment.appointmentId).subscribe({
      next: () => {
        alert(this.translateService.instant('SUCCESS.APPOINTMENT_UPDATED'));
        this.handleSearchAppointments();
        this.submitted = false;
        updateModal.close();
      },
      error: err => {
        alert(this.translateService.instant('ERROR.UPDATE_APPOINTMENT') + ": " + err.message);
      }
    });
  }

  // Helper method to get the appropriate CSS class based on appointment status
  getStatusClass(status: string): string {
    if (!status) return '';

    const statusLower = status.toLowerCase();

    // Adaugă "geplant" în lista de statusuri programate
    if (statusLower === 'scheduled' || statusLower === 'programată' ||
      statusLower === 'programat' || statusLower === 'geplant')
      return 'status-scheduled';

    if (statusLower === 'confirmed' || statusLower === 'confirmată' ||
      statusLower === 'confirmat' || statusLower === 'bestätigt')
      return 'status-confirmed';

    if (statusLower === 'completed' || statusLower === 'finalizată' ||
      statusLower === 'finalizat' || statusLower === 'abgeschlossen')
      return 'status-completed';

    if (statusLower === 'cancelled' || statusLower === 'canceled' ||
      statusLower === 'anulată' || statusLower === 'anulat' ||
      statusLower === 'storniert')
      return 'status-cancelled';

    if (statusLower === 'pending' || statusLower === 'în așteptare' ||
      statusLower === 'wartend')
      return 'status-pending';

    return '';
  }

  // Metodă pentru a returna mesajul de eroare pentru câmpul de dată
  getDateErrorMessage(): string {
    const dateControl = this.appointmentFormGroup?.get('appointmentDate');

    if (dateControl?.hasError('required')) {
      return this.translateService.instant('VALIDATION.APPOINTMENT_DATE_REQUIRED');
    }

    if (dateControl?.hasError('pastDate')) {
      return this.translateService.instant('VALIDATION.APPOINTMENT_FUTURE_DATE');
    }

    return '';
  }

  getUpdateDateErrorMessage(): string {
    const dateControl = this.updateAppointmentFormGroup?.get('appointmentDate');

    if (dateControl?.hasError('required')) {
      return this.translateService.instant('VALIDATION.APPOINTMENT_DATE_REQUIRED');
    }

    if (dateControl?.hasError('pastDate')) {
      return this.translateService.instant('VALIDATION.APPOINTMENT_FUTURE_DATE');
    }

    return '';
  }

  getFormattedStatus(status: string): string {
    if (!status) return '';
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus.includes('complet') || normalizedStatus === 'completed') {
      return this.translateService.instant('STATUS.COMPLETED');
    }
    if (normalizedStatus.includes('confirm') || normalizedStatus === 'confirmed') {
      return this.translateService.instant('STATUS.CONFIRMED');
    }
    if (normalizedStatus.includes('cancel') || normalizedStatus === 'cancelled') {
      return this.translateService.instant('STATUS.CANCELED');
    }
    if (normalizedStatus.includes('schedul') || normalizedStatus === 'scheduled' ||
      normalizedStatus.includes('program') || normalizedStatus === 'geplant') {
      return this.translateService.instant('STATUS.SCHEDULED');
    }
    return status;
  }
}
