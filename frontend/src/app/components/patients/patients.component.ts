import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { PatientsService } from '../../services/patients.service';
import { catchError, Observable, throwError } from 'rxjs';
import { PageRespone } from '../../model/page.response.model';
import { Patient } from '../../model/patient.model';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AppointmentsService} from '../../services/appointments.service';
import {Appointment} from '../../model/appointment.model';


@Component({
  selector: 'app-patients',
  standalone: true,
  templateUrl: './patients.component.html',
  imports: [
    ReactiveFormsModule,
    NgIf,
    AsyncPipe,
    NgForOf,
    NgClass
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
  appointmentCurrentPage: number =0;
  pageAppointment$!:Observable<PageRespone<Appointment>>;
  appointmentPageSize: number =5;
  appointmentErrorMessage!:string;

  private patientsService = inject(PatientsService); // Injectare Lazy
  private appointmentService = inject(AppointmentsService);

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
    this.submitted=false;
    this.modalService.open(content, {size : 'xl'})
  }

  onCloseModal(modal: any) {
    modal.close();
    this.patientFormGroup.reset();
  }


  handleSearchPatients() {
    let keyword = this.searchFormGroup.value.keyword;
    this.pagePatients = this.patientsService.searchPatients(keyword, this.currentPage, this.pageSize).pipe(
      catchError(err => {
        console.error("Error fetching patients:", err);
        this.errorMessage = "Failed to load patients!";
        return throwError(err);
      })
    );
  }


  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchPatients();
  }

  handleDeletePatients(p:Patient) {
    let conf = confirm("Are you sure?");
    if(!conf) return;
    this.patientsService.deletePatient(p.patientId).subscribe({
      next:() => {
        this.handleSearchPatients();
      },
      error: err => {
        alert(err.message);
        console.log(err)
      }
    })
  }

  onSavePatient(modal: any) {
    this.submitted = true; // Marchează formularul ca fiind trimis

    if (this.patientFormGroup.invalid) {
      console.log("Form is invalid", this.patientFormGroup.errors);
      return; // Oprește execuția dacă formularul are erori
    }

    // Construim obiectul Patient pentru a-l trimite către backend
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
        alert("Patient saved successfully");
        this.handleSearchPatients();
        this.submitted = false;
        this.patientFormGroup.reset();
        modal.close();
      },
      error: err => {
        alert("Error saving patient: " + err.message);
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
      patientId: Number(this.updatePatientFormGroup.value.patientId), // Convertim în număr
      firstName: this.updatePatientFormGroup.value.firstName,
      lastName: this.updatePatientFormGroup.value.lastName,
      medicalHistory: Array.isArray(this.updatePatientFormGroup.value.medicalHistory)
        ? this.updatePatientFormGroup.value.medicalHistory
        : [this.updatePatientFormGroup.value.medicalHistory], // Convertește într-un array dacă e necesar
      allergies: Array.isArray(this.updatePatientFormGroup.value.allergies)
        ? this.updatePatientFormGroup.value.allergies
        : [this.updatePatientFormGroup.value.allergies],
      user: {
        email: this.updatePatientFormGroup.value.user?.email, // Verificăm dacă `user` există
        password: this.updatePatientFormGroup.value.user?.password
      }
    };

    console.log("Updating patient:", patient); // Verifică structura înainte de a trimite

    this.patientsService.updatePatient(patient, patient.patientId).subscribe({
      next: () => {
        alert('Success updating Patient');
        this.handleSearchPatients();
        this.submitted = false;
        updateModal.close();
      },
      error: err => {
        alert('Error updating patient: ' + err.message);
      }
    });
  }

  getAppointmentModal(p: Patient, appointmentContent: any) {
    this.appointmentCurrentPage =0 ;
    this.modalPatient = p;
    this.handleSearchAppointments(p);
    this.modalService.open(appointmentContent, {size:'xl'});

  }

  handleSearchAppointments(p: Patient) {
    this.pageAppointment$ = this.appointmentService.getAppointmentsByPatient(p.patientId, this.appointmentCurrentPage, this.appointmentPageSize).pipe(
      catchError( err => {
        this.appointmentErrorMessage = err.message;
        return throwError(err);
      })
    )
  }

  gotoAppointmentsPage(page: number) {
    this.appointmentCurrentPage = page;
    this.handleSearchAppointments(this.modalPatient);

  }
}
