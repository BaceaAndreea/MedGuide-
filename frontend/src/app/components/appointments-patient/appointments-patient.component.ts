import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Patient} from '../../model/patient.model';
import {catchError, Observable, tap, throwError} from 'rxjs';
import {PageRespone} from '../../model/page.response.model';
import {Appointment} from '../../model/appointment.model';
import {AppointmentsService} from '../../services/appointments.service';
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Doctor} from '../../model/doctor.model';
import {DoctorsService} from '../../services/doctors.service';
import { futureDateValidator} from '../../validators/date-validator';
import { Specialization } from '../../model/specialization.model';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import {TranslateModule, TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'app-appointments-patient',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgForOf,
    NgClass,
    ReactiveFormsModule,
    DatePipe,
    TranslateModule
  ],
  templateUrl: './appointments-patient.component.html',
  styleUrl: './appointments-patient.component.scss'
})
export class AppointmentsPatientComponent implements OnInit{

  patientId!: number;
  currentPatient!: Patient;
  pageAppointments$!: Observable<PageRespone<Appointment>>;
  currentPage: number = 0;
  pageSize : number= 5;
  errorMessage !: string;
  appointmentFormGroup!:FormGroup;
  submitted:boolean = false;
  doctors$!:Observable<Array<Doctor>>;
  specializations$!:Observable<Array<Specialization>>;
  filteredDoctors: Doctor[] = [];
  errorMessageDoctor!: string;
  updateAppointmentFormGroup!:FormGroup;
  defaultDoctor!: Doctor;
  totalAppointments: number = 0;
  upcomingAppointments: number = 0;
  completedAppointments: number = 0;
  canceledAppointments: number = 0;
  minDate!: string;
  currentDate: Date = new Date();
  private appointmentService = inject(AppointmentsService);
  currentLang: string = 'ro'; // Default language

  constructor(
    private route : ActivatedRoute,
    private fb : FormBuilder,
    private modalService : NgbModal,
    private doctorService : DoctorsService,
    private translate: TranslateService // Inject TranslateService
  ) {
    // Initialize language
    this.translate.setDefaultLang('ro');
    this.translate.use(this.currentLang);

    // Subscribe to language changes
    this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
    });
  }

  fetchSpecializations() {
    this.specializations$ = this.doctorService.findAllSpecializations().pipe(
      catchError(err => {
        this.errorMessageDoctor = this.translate.instant('ERROR.FETCH_SPECIALIZATIONS') + ': ' + err.message;
        return throwError(err);
      })
    );
  }

  fetchDoctorsBySpecialization(specializationId: number | null | undefined) {
    if (!specializationId) {
      this.filteredDoctors = [];
      return;
    }

    this.doctorService.findDoctorsBySpecialization(specializationId).subscribe({
      next: (doctors) => {
        this.filteredDoctors = doctors;
        if (this.filteredDoctors.length === 0) {
          // If there are no doctors for this specialization, show a message
          this.errorMessageDoctor = this.translate.instant('ERROR.FETCH_DOCTORS') + ': ' +
            this.translate.instant('APPOINTMENTS.NO_APPOINTMENTS');
        } else {
          this.errorMessageDoctor = '';
        }
      },
      error: (err) => {
        this.errorMessageDoctor = this.translate.instant('ERROR.FETCH_DOCTORS') + ': ' + err.message;
        console.error(err);
      }
    });
  }

  fetchDoctors() {
    this.doctors$ = this.doctorService.findAllDoctors().pipe(
      catchError(err => {
        this.errorMessageDoctor = this.translate.instant('ERROR.FETCH_DOCTORS') + ': ' + err.message;
        return throwError(err);
      })
    )
  }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.params['id'];
    this.fillCurrentPatient();
    this.handleSearchPatientAppointments();
    this.minDate = new Date().toISOString().slice(0, 16);
  }

  private fillCurrentPatient() {
    this.currentPatient = {
      patientId : this.patientId,
      firstName: "",
      lastName: "",
      medicalHistory: [],
      allergies: [],
      user:{email: "", password: ""}
    }
  }

  private handleSearchPatientAppointments() {
    this.pageAppointments$ = this.appointmentService.getAppointmentsByPatient(this.patientId, this.currentPage, this.pageSize)
      .pipe(
        catchError(err => {
          this.errorMessage = this.translate.instant('ERROR.FETCH_APPOINTMENTS') + ': ' + err.message;
          return throwError(err);
        }),
        tap(pageResponse => {
          this.calculateDashboardSummary(pageResponse.content);
        })
      );
  }

  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchPatientAppointments();
  }

  private subscriptions = new Subscription(); // Add this property to the component class

  getModal(content: any) {
    this.submitted = false;
    this.appointmentFormGroup = this.fb.group({
      appointmentDate: [null, [Validators.required, futureDateValidator()]],
      reason: ["", Validators.required],
      specialization: [null, Validators.required],
      doctor: [null, Validators.required],
      patient: [this.currentPatient, Validators.required]
    });

    // Initially disable the doctor field until a specialization is selected
    this.appointmentFormGroup.get('doctor')?.disable();

    // When the specialization changes, update the list of doctors
    // Save the subscription to unsubscribe later
    const specializationControl = this.appointmentFormGroup.get('specialization');

    if (specializationControl) {
      const subscription = specializationControl.valueChanges.pipe(
        filter((value: number | null | undefined) => value !== null && value !== undefined)
      ).subscribe(specializationId => {
        this.fetchDoctorsBySpecialization(specializationId);
        this.appointmentFormGroup.get('doctor')?.enable();
        this.appointmentFormGroup.get('doctor')?.setValue(null);
      });

      this.subscriptions.add(subscription);
    }


    this.fetchSpecializations();
    this.modalService.open(content, {size:'xl'}).result.then(
      () => {
        // When the modal is closed, unsubscribe
        this.subscriptions.unsubscribe();
        this.subscriptions = new Subscription();
      },
      () => {
        // And on dismiss
        this.subscriptions.unsubscribe();
        this.subscriptions = new Subscription();
      }
    );
  }

  onCloseModal(modal: any) {
    modal.close();
    this.appointmentFormGroup.reset();
    this.filteredDoctors = [];
  }

  onSaveAppointment(modal: any) {
    this.submitted = true;

    if (this.appointmentFormGroup.invalid) return;

    const appointmentDateISO = new Date(this.appointmentFormGroup.value.appointmentDate).toISOString();

    const appointment = {
      appointmentDate: appointmentDateISO,
      status: "Confirmată",
      reason: this.appointmentFormGroup.value.reason,
      doctor: { doctorId: this.appointmentFormGroup.value.doctor?.doctorId },
      patient: { patientId: this.currentPatient?.patientId }
    };

    this.appointmentService.saveAppointment(appointment).subscribe({
      next: () => {
        alert(this.translate.instant('SUCCESS.APPOINTMENT_CREATED'));
        setTimeout(() => this.handleSearchPatientAppointments(), 500);
        this.appointmentFormGroup.reset();
        this.submitted = false;
        modal.close();
      },
      error: err => {
        alert(this.translate.instant('ERROR.SAVE_APPOINTMENT') + ': ' + err.message);
        console.error(err);
      }
    });
  }

  getUpdateModal(a: any, updateContent: any) {
    this.fetchSpecializations();

    let initialSpecializationId = a.doctor?.specialization?.specializationId;

    this.updateAppointmentFormGroup = this.fb.group({
      appointmentId: [a.appointmentId, Validators.required],
      appointmentDate: [a.appointmentDate, [Validators.required, futureDateValidator()]],
      specialization: [initialSpecializationId, Validators.required],
      doctor: [a.doctor, Validators.required],
      status: [a.status, Validators.required],
      reason: [a.reason, Validators.required],
    });

    // Load the doctors for the initial specialization
    if (initialSpecializationId) {
      this.fetchDoctorsBySpecialization(initialSpecializationId);
    }

    // Listen for specialization changes (with pipe and filter)
    const specializationControl = this.updateAppointmentFormGroup.get('specialization');

    if (specializationControl) {
      const subscription = specializationControl.valueChanges.pipe(
        filter((value: number | null | undefined) => value !== null && value !== undefined)
      ).subscribe(specializationId => {
        this.fetchDoctorsBySpecialization(specializationId);
        this.updateAppointmentFormGroup.get('doctor')?.setValue(null);
      });

      this.subscriptions.add(subscription); // for unsubscribing when the modal closes
    }

    this.defaultDoctor = this.updateAppointmentFormGroup.controls['doctor'].value;
    this.modalService.open(updateContent, { size: 'xl' }).result.then(
      () => {
        this.subscriptions.unsubscribe();
        this.subscriptions = new Subscription(); // reset subs
      },
      () => {
        this.subscriptions.unsubscribe();
        this.subscriptions = new Subscription(); // reset subs
      }
    );
  }

  getDateErrorMessage(): string {
    const dateControl = this.appointmentFormGroup?.get('appointmentDate');

    if (dateControl?.hasError('required')) {
      return this.translate.instant('VALIDATION.APPOINTMENT_DATE_REQUIRED');
    }

    if (dateControl?.hasError('pastDate')) {
      return this.translate.instant('VALIDATION.APPOINTMENT_FUTURE_DATE');
    }

    return '';
  }

  getUpdateDateErrorMessage(): string {
    const dateControl = this.updateAppointmentFormGroup?.get('appointmentDate');

    if (dateControl?.hasError('required')) {
      return this.translate.instant('VALIDATION.APPOINTMENT_DATE_REQUIRED');
    }

    if (dateControl?.hasError('pastDate')) {
      return this.translate.instant('VALIDATION.APPOINTMENT_FUTURE_DATE');
    }

    return '';
  }

  onUpdateAppointment(updateModal: any) {
    this.submitted = true;
    if (this.updateAppointmentFormGroup.invalid) return;

    const appointment = {
      appointmentId: this.updateAppointmentFormGroup.value.appointmentId,
      appointmentDate: this.updateAppointmentFormGroup.value.appointmentDate,
      status: this.updateAppointmentFormGroup.value.status,
      reason: this.updateAppointmentFormGroup.value.reason,
      doctor: { doctorId: this.updateAppointmentFormGroup.value.doctor?.doctorId },
      patient: { patientId: this.currentPatient?.patientId }
    };

    this.appointmentService.updateAppointment(appointment, appointment.appointmentId).subscribe({
      next: () => {
        alert(this.translate.instant('SUCCESS.APPOINTMENT_UPDATED'));
        this.handleSearchPatientAppointments();
        this.submitted = false;
        updateModal.close();
      },
      error: err => {
        alert(this.translate.instant('ERROR.UPDATE_APPOINTMENT') + ': ' + err.message);
      }
    });
  }

  handleDeleteAppointment(a: Appointment) {
    let conf = confirm(this.translate.instant('CONFIRMATION.DELETE_APPOINTMENT'));
    if(!conf) return;

    const cancelledAppointment = {
      appointmentId: a.appointmentId,
      appointmentDate: a.appointmentDate,
      status: this.translate.instant('STATUS.CANCELED'),
      reason: a.reason,
      doctor: { doctorId: a.doctor?.doctorId },
      patient: { patientId: this.currentPatient?.patientId }
    };

    this.appointmentService.updateAppointment(cancelledAppointment, cancelledAppointment.appointmentId).subscribe({
      next: () => {
        alert(this.translate.instant('SUCCESS.APPOINTMENT_CANCELLED'));
        this.handleSearchPatientAppointments();
      },
      error: err => {
        alert(this.translate.instant('ERROR.CANCEL_APPOINTMENT') + ': ' + err.message);
        console.error(err);
      }
    });
  }

  getStatusClass(status: string): string {
    status = status?.toLowerCase() || '';

    if (status.includes('programat') || status.includes('scheduled') || status.includes('confirmată') || status.includes('confirmed')) {
      return 'status-confirmed';
    } else if (status.includes('finalizat') || status.includes('completed')) {
      return 'status-completed';
    } else if (status.includes('anulat') || status.includes('anulată') || status.includes('cancelled') || status.includes('canceled')) {
      return 'status-cancelled';
    } else if (status.includes('în așteptare') || status.includes('pending')) {
      return 'status-pending';
    }

    return '';
  }

  calculateDashboardSummary(appointments: Appointment[]): void {
    if (!appointments) return;

    const now = new Date();

    this.totalAppointments = appointments.length;
    this.upcomingAppointments = 0;
    this.completedAppointments = 0;
    this.canceledAppointments = 0;

    appointments.forEach(appointment => {
      const status = appointment.status ? appointment.status.toLowerCase() : '';
      const appointmentDate = new Date(appointment.appointmentDate);

      if (status.includes('finalizat') || status.includes('completed')) {
        this.completedAppointments++;
      }
      else if (status.includes('anulat') || status.includes('cancelled') || status.includes('canceled')) {
        this.canceledAppointments++;
      }
      else if (appointmentDate > now) {
        this.upcomingAppointments++;
      }
    });
  }

  getFormattedStatus(status: string): string {
    if (!status) return '';

    const normalizedStatus = status.toLowerCase();

    // Use translated status based on current language
    if (normalizedStatus.includes('complet') || normalizedStatus === 'completed') {
      return this.translate.instant('STATUS.COMPLETED');
    }
    if (normalizedStatus.includes('confirm') || normalizedStatus === 'confirmed') {
      return this.translate.instant('STATUS.CONFIRMED');
    }
    if (normalizedStatus.includes('cancel') || normalizedStatus === 'cancelled') {
      return this.translate.instant('STATUS.CANCELED');
    }
    if (normalizedStatus.includes('schedul') || normalizedStatus === 'scheduled' ||
      normalizedStatus.includes('appointment')) {
      return this.translate.instant('STATUS.SCHEDULED');
    }
    return status;
  }
}
