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

//this component is the user interface for user who has the role of a patient,
//we will be able to display the view of that patient whici contains the list of their appointments and other functionalities

@Component({
  selector: 'app-appointments-patient',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgForOf,
    NgClass,
    ReactiveFormsModule,
    DatePipe
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

  constructor(private route : ActivatedRoute,  private fb : FormBuilder,
              private modalService : NgbModal, private doctorService : DoctorsService) {}


  fetchDoctors() {
    this.doctors$ = this.doctorService.findAllDoctors().pipe(
      catchError(err => {
        this.errorMessageDoctor = err.message;
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
          this.errorMessage = err.message;
          return throwError(err);
        }),
        tap(pageResponse => {
          // Call the dashboard summary calculation when appointments are loaded
          this.calculateDashboardSummary(pageResponse.content);
        })
      );
  }




  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchPatientAppointments();

  }

  getModal(content: any) {
    this.submitted = false;
    this.appointmentFormGroup = this.fb.group({
      appointmentDate: [null, [Validators.required, futureDateValidator()]],
      reason: ["", Validators.required],
      doctor: [null, Validators.required],
      patient: [this.currentPatient, Validators.required]
    });
    this.fetchDoctors();
    this.modalService.open(content, {size:'xl'});
  }

  onCloseModal(modal: any) {
    modal.close();
    this.appointmentFormGroup.reset();
  }

  onSaveAppointment(modal: any) {
    this.submitted = true;

    if (this.appointmentFormGroup.invalid) return;

    const appointmentDateISO = new Date(this.appointmentFormGroup.value.appointmentDate).toISOString();

    const appointment = {
      appointmentDate: appointmentDateISO,
      status: "Confirmată",  // Status setat automat
      reason: this.appointmentFormGroup.value.reason, // Motivul introdus de pacient
      doctor: { doctorId: this.appointmentFormGroup.value.doctor?.doctorId },
      patient: { patientId: this.currentPatient?.patientId }
    };

    this.appointmentService.saveAppointment(appointment).subscribe({
      next: () => {
        alert("Programare creată cu succes");
        setTimeout(() => this.handleSearchPatientAppointments(), 500);
        this.appointmentFormGroup.reset();
        this.submitted = false;
        modal.close();
      },
      error: err => {
        alert("Eroare la crearea programării: " + err.message);
        console.error(err);
      }
    });
  }



  getUpdateModal(a: any, updateContent: any) {
    this.fetchDoctors();

    this.updateAppointmentFormGroup = this.fb.group({
      appointmentId: [a.appointmentId, Validators.required],
      appointmentDate: [a.appointmentDate, [Validators.required, futureDateValidator()]],
      doctor: [a.doctor, Validators.required],
      status: [a.status, Validators.required],  // Statusul (read-only)
      reason: [a.reason, Validators.required],  // Motivul programării
    });

    this.defaultDoctor = this.updateAppointmentFormGroup.controls['doctor'].value;
    this.modalService.open(updateContent, {size:'xl'});
  }
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


  onUpdateAppointment(updateModal: any) {
    this.submitted = true;
    if (this.updateAppointmentFormGroup.invalid) return;

    const appointment = {
      appointmentId: this.updateAppointmentFormGroup.value.appointmentId,
      appointmentDate: this.updateAppointmentFormGroup.value.appointmentDate,
      status: this.updateAppointmentFormGroup.value.status, // Păstrăm statusul curent
      reason: this.updateAppointmentFormGroup.value.reason, // Actualizăm motivul
      doctor: { doctorId: this.updateAppointmentFormGroup.value.doctor?.doctorId },
      patient: { patientId: this.currentPatient?.patientId }
    };

    this.appointmentService.updateAppointment(appointment, appointment.appointmentId).subscribe({
      next: () => {
        alert("Programare actualizată cu succes");
        this.handleSearchPatientAppointments();
        this.submitted = false;
        updateModal.close();
      },
      error: err => {
        alert(err.message);
      }
    });
  }

  handleDeleteAppointment(a: Appointment) {
    let conf = confirm("Ești sigur că dorești să anulezi această programare?");
    if(!conf) return;

    // Actualizăm statusul la "Anulată" în loc să o ștergem
    const cancelledAppointment = {
      appointmentId: a.appointmentId,
      appointmentDate: a.appointmentDate,
      status: "Anulată",  // Status setat automat
      reason: a.reason,  // Păstrăm motivul existent
      doctor: { doctorId: a.doctor?.doctorId },
      patient: { patientId: this.currentPatient?.patientId }
    };

    this.appointmentService.updateAppointment(cancelledAppointment, cancelledAppointment.appointmentId).subscribe({
      next: () => {
        alert("Programare anulată cu succes");
        this.handleSearchPatientAppointments();
      },
      error: err => {
        alert("Eroare la anularea programării: " + err.message);
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

      // Count completed appointments
      if (status.includes('finalizat') || status.includes('completed')) {
        this.completedAppointments++;
      }
      // Count cancelled appointments
      else if (status.includes('anulat') || status.includes('cancelled') || status.includes('canceled')) {
        this.canceledAppointments++;
      }
      // Count upcoming appointments - toate programările viitoare care nu sunt anulate sau finalizate
      else if (appointmentDate > now) {
        this.upcomingAppointments++;
      }
    });
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
