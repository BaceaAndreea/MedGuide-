import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { PatientsService } from '../../services/patients.service';
import {catchError, Observable, tap, throwError} from 'rxjs';
import { PageRespone } from '../../model/page.response.model';
import { Patient } from '../../model/patient.model';
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AppointmentsService} from '../../services/appointments.service';
import {Appointment} from '../../model/appointment.model';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-patients',
  standalone: true,
  templateUrl: './patients.component.html',
  imports: [
    ReactiveFormsModule,
    NgIf,
    AsyncPipe,
    NgForOf,
    NgClass,
    DatePipe,
    TranslateModule
  ],
  styleUrl: './patients.component.scss'
})
export class PatientsComponent implements OnInit {
  searchFormGroup!: FormGroup;
  modalPatient!:Patient;
  currentPage: number = 0;
  pageSize: number = 5;
  errorMessage!: string;
  pagePatients!: Observable<PageRespone<Patient>>;
  submitted : boolean = false;
  patientFormGroup !: FormGroup;
  updatePatientFormGroup!: FormGroup;
  appointmentCurrentPage: number = 0;
  pageAppointment$!: Observable<PageRespone<Appointment>>;
  appointmentPageSize: number = 5;
  appointmentErrorMessage!: string;

  // Proprietăți pentru statistici
  patientsData: PageRespone<Patient> | null = null;
  totalPatients: number = 0;
  activePatients: number = 0;
  newPatients: number = 0;
  appointmentsNeeded: number = 0;
  originalPatient: Patient | null = null;

  private patientsService = inject(PatientsService);
  private appointmentService = inject(AppointmentsService);
  private translate = inject(TranslateService);

  constructor(
    private modalService : NgbModal,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword: this.fb.control('')
    });
    this.patientFormGroup = this.fb.group({
      firstName:["", Validators.required],
      lastName:["", Validators.required],
      medicalHistory: [[]],
      allergies: [[]],
      user: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      })
    });

    this.handleSearchPatients(); // Load patients on init
  }

  // Deschide modalul
  openModal(content:any){
    this.submitted = false;
    this.modalService.open(content, {size : 'xl'})
  }

  onCloseModal(modal: any) {
    modal.close();
    this.patientFormGroup.reset();
  }

  handleSearchPatients() {
    let keyword = this.searchFormGroup.value.keyword;
    this.pagePatients = this.patientsService.searchPatients(keyword, this.currentPage, this.pageSize).pipe(
      tap(data => {
        this.patientsData = data;
        this.totalPatients = data.totalElements;
        this.activePatients = data.totalElements; // Asumăm că toți pacienții sunt activi pentru moment
      }),
      catchError(err => {
        console.error("Error fetching patients:", err);
        this.translate.get('ERROR.FETCH_PATIENTS').subscribe((res: string) => {
          this.errorMessage = res;
        });
        return throwError(() => err);
      })
    );
  }

  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchPatients();
  }

  handleDeletePatients(p:Patient) {
    this.translate.get('CONFIRMATION.DELETE_PATIENT').subscribe((confirmMessage: string) => {
      let conf = confirm(confirmMessage);
      if(!conf) return;

      this.patientsService.deletePatient(p.patientId).subscribe({
        next:() => {
          this.translate.get('SUCCESS.PATIENT_DELETED').subscribe((successMessage: string) => {
            alert(successMessage);
          });
          this.handleSearchPatients();
        },
        error: err => {
          this.translate.get('ERROR.DELETE_PATIENT').subscribe((errorMessage: string) => {
            alert(errorMessage);
          });
          console.log(err);
        }
      });
    });
  }

  onSavePatient(modal: any) {
    this.submitted = true;

    if (this.patientFormGroup.invalid) {
      console.log("Form is invalid", this.patientFormGroup.errors);
      return;
    }

    // Construim obiectul Patient
    const patient = {
      firstName: this.patientFormGroup.value.firstName,
      lastName: this.patientFormGroup.value.lastName,
      medicalHistory: this.patientFormGroup.value.medicalHistory ? [this.patientFormGroup.value.medicalHistory] : [],
      allergies: this.patientFormGroup.value.allergies ? [this.patientFormGroup.value.allergies] : [],
      user: {
        email: this.patientFormGroup.value.user.email,
        password: this.patientFormGroup.value.user.password
      }
    };

    console.log("Submitting patient:", patient);

    this.patientsService.savePatient(patient).subscribe({
      next: () => {
        this.translate.get('SUCCESS.PATIENT_CREATED').subscribe((successMessage: string) => {
          alert(successMessage);
        });
        this.handleSearchPatients();
        this.submitted = false;
        this.patientFormGroup.reset();
        modal.close();
      },
      error: err => {
        this.translate.get('ERROR.SAVE_PATIENT').subscribe((errorMessage: string) => {
          alert(errorMessage + ": " + err.message);
        });
        console.error("Save error:", err);
      }
    });
  }

  getUpdatePatientModal(p: Patient, updateContent: any) {
    this.updatePatientFormGroup = this.fb.group({
      patientId: [p.patientId, Validators.required],
      firstName: [p.firstName, Validators.required],
      lastName: [p.lastName, Validators.required],
      medicalHistory: [Array.isArray(p.medicalHistory) ? p.medicalHistory : [], Validators.required],
      allergies: [Array.isArray(p.allergies) ? p.allergies : [], Validators.required]
    });

    setTimeout(() => {
      this.updatePatientFormGroup.patchValue({
        medicalHistory: Array.isArray(p.medicalHistory) ? p.medicalHistory : [],
        allergies: Array.isArray(p.allergies) ? p.allergies : []
      });
    });

    this.modalService.open(updateContent, { size: 'xl' });
  }

  onUpdatePatient(updateModal: any) {
    this.submitted = true;
    if (this.updatePatientFormGroup.invalid) return;

    const patient = {
      patientId: Number(this.updatePatientFormGroup.value.patientId),
      firstName: this.updatePatientFormGroup.value.firstName,
      lastName: this.updatePatientFormGroup.value.lastName,
      medicalHistory: Array.isArray(this.updatePatientFormGroup.value.medicalHistory)
        ? this.updatePatientFormGroup.value.medicalHistory
        : [this.updatePatientFormGroup.value.medicalHistory],
      allergies: Array.isArray(this.updatePatientFormGroup.value.allergies)
        ? this.updatePatientFormGroup.value.allergies
        : [this.updatePatientFormGroup.value.allergies],
      user: {
        email: this.updatePatientFormGroup.value.user?.email,
        password: this.updatePatientFormGroup.value.user?.password
      }
    };

    console.log("Updating patient:", patient);

    this.patientsService.updatePatient(patient, patient.patientId).subscribe({
      next: () => {
        this.translate.get('SUCCESS.PATIENT_UPDATED').subscribe((successMessage: string) => {
          alert(successMessage);
        });
        this.handleSearchPatients();
        this.submitted = false;
        updateModal.close();
      },
      error: err => {
        this.translate.get('ERROR.UPDATE_PATIENT').subscribe((errorMessage: string) => {
          alert(errorMessage + ": " + err.message);
        });
      }
    });
  }

  getAppointmentModal(p: Patient, appointmentContent: any) {
    this.appointmentCurrentPage = 0;
    this.modalPatient = p;
    this.handleSearchAppointments(p);
    this.modalService.open(appointmentContent, {size:'xl'});
  }

  handleSearchAppointments(p: Patient) {
    this.pageAppointment$ = this.appointmentService.getAppointmentsByPatient(p.patientId, this.appointmentCurrentPage, this.appointmentPageSize).pipe(
      catchError(err => {
        this.translate.get('ERROR.FETCH_APPOINTMENTS').subscribe((errorMessage: string) => {
          this.appointmentErrorMessage = errorMessage;
        });
        return throwError(() => err);
      })
    );
  }

  gotoAppointmentsPage(page: number) {
    this.appointmentCurrentPage = page;
    this.handleSearchAppointments(this.modalPatient);
  }

  // Metode pentru statusuri programări
  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'status-scheduled';
      case 'confirmed': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'canceled': return 'status-cancelled';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }
}
