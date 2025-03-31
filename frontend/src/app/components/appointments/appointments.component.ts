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



@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    AsyncPipe,
    NgForOf,
    CommonModule,
    NgbModalModule

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
    private authService: AuthService
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
            if (status.includes('finalizat') || status.includes('completed')) {
              this.completedAppointments++;
            } else if (status.includes('anulat') || status.includes('cancelled') || status.includes('canceled')) {
              this.canceledAppointments++;
            } else if (appointmentDate > currentDate) {
              // If appointment date is in the future and not canceled/completed
              this.upcomingAppointments++;
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
    let conf = confirm("Ești sigur că dorești să anulezi această programare?");
    if (!conf) return;

    // În loc să ștergem programarea, actualizăm statusul la "Anulată"
    const cancelledAppointment = {
      appointmentId: a.appointmentId,
      appointmentDate: a.appointmentDate,
      status: "Anulată", // Status setat la anulată
      reason: a.reason,
      doctor: { doctorId: a.doctor?.doctorId },
      patient: { patientId: a.patient?.patientId }
    };

    this.appointmentService.updateAppointment(cancelledAppointment, cancelledAppointment.appointmentId).subscribe({
      next: () => {
        alert("Programare anulată cu succes");
        this.handleSearchAppointments();
      },
      error: err => {
        alert("Eroare la anularea programării: " + err.message);
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
      status: "Confirmată", // Status setat automat
      reason: this.appointmentFormGroup.value.reason,
      doctor: { doctorId: this.appointmentFormGroup.value.doctor?.doctorId },
      patient: { patientId: this.appointmentFormGroup.value.patient?.patientId }
    };

    this.appointmentService.saveAppointment(appointment).subscribe({
      next: () => {
        alert("Programare creată cu succes");
        this.handleSearchAppointments();
        this.appointmentFormGroup.reset();
        this.submitted = false;
        modal.close();
      },
      error: err => {
        alert("Eroare la salvarea programării: " + err.message);
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
        alert("Programare actualizată cu succes");
        this.handleSearchAppointments();
        this.submitted = false;
        updateModal.close();
      },
      error: err => {
        alert(err.message);
      }
    });
  }

  // Helper method to get the appropriate CSS class based on appointment status
  getStatusClass(status: string): string {
    if (!status) return '';

    const statusLower = status.toLowerCase();

    if (statusLower === 'scheduled' || statusLower === 'programată' || statusLower === 'programat')
      return 'status-scheduled';
    if (statusLower === 'confirmed' || statusLower === 'confirmată' || statusLower === 'confirmat')
      return 'status-confirmed';
    if (statusLower === 'completed' || statusLower === 'finalizată' || statusLower === 'finalizat')
      return 'status-completed';
    if (statusLower === 'cancelled' || statusLower === 'canceled' || statusLower === 'anulată' || statusLower === 'anulat')
      return 'status-cancelled';
    if (statusLower === 'pending' || statusLower === 'în așteptare')
      return 'status-pending';

    return '';
  }

  // Metodă pentru a returna mesajul de eroare pentru câmpul de dată
  getDateErrorMessage(): string {
    const dateControl = this.appointmentFormGroup?.get('appointmentDate');

    if (dateControl?.hasError('required')) {
      return 'Data programării este obligatorie';
    }

    if (dateControl?.hasError('pastDate')) {
      return 'Nu poți programa în trecut. Te rugăm să selectezi o dată viitoare.';
    }

    return '';
  }

  // Metodă pentru a returna mesajul de eroare pentru câmpul de dată din formularul de actualizare
  getUpdateDateErrorMessage(): string {
    const dateControl = this.updateAppointmentFormGroup?.get('appointmentDate');

    if (dateControl?.hasError('required')) {
      return 'Data programării este obligatorie';
    }

    if (dateControl?.hasError('pastDate')) {
      return 'Nu poți programa în trecut. Te rugăm să selectezi o dată viitoare.';
    }

    return '';
  }

  getFormattedStatus(status: string): string {
    if (!status) return '';
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus.includes('complet') || normalizedStatus === 'completed') {
      return 'Finalizată';
    }
    if (normalizedStatus.includes('confirm') || normalizedStatus === 'confirmed') {
      return 'Confirmată';
    }
    if (normalizedStatus.includes('cancel') || normalizedStatus === 'cancelled') {
      return 'Anulată';
    }
    if (normalizedStatus.includes('schedul') || normalizedStatus === 'scheduled' ||
      normalizedStatus.includes('appointment')) {
      return 'Programată';
    }
    return status;
  }
}
