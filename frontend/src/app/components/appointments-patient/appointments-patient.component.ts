import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Patient} from '../../model/patient.model';
import {catchError, Observable, throwError} from 'rxjs';
import {PageRespone} from '../../model/page.response.model';
import {Appointment} from '../../model/appointment.model';
import {AppointmentsService} from '../../services/appointments.service';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Doctor} from '../../model/doctor.model';
import {DoctorsService} from '../../services/doctors.service';

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
    ReactiveFormsModule
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
        })
      );
  }




  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchPatientAppointments();

  }

  getModal(content: any) {
    this.submitted=false;
    this.appointmentFormGroup = this.fb.group({
      appointmentDate: [null, Validators.required],
      appointmentStatus: ["", Validators.required],
      doctor: [null, Validators.required],
      patient: [this.currentPatient, Validators.required]
    })
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

    const appointment = {
      appointmentDate: this.appointmentFormGroup.value.appointmentDate,
      status: this.appointmentFormGroup.value.appointmentStatus,
      doctor: { doctorId: this.appointmentFormGroup.value.doctor?.doctorId }, //trimitem id-ul
      patient: { patientId: this.currentPatient?.patientId }

    };

    this.appointmentService.saveAppointment(appointment).subscribe({
      next: () => {
        alert("Success Saving Appointment");
        setTimeout(() => this.handleSearchPatientAppointments(), 500);
        this.appointmentFormGroup.reset();
        this.submitted = false;
        modal.close();
      },
      error: err => {
        alert("Error saving appointment: " + err.message);
        console.error(err);
      }
    });
  }


  getUpdateModal(a: any, updateContent: any) {
    this.fetchDoctors();

    this.updateAppointmentFormGroup = this.fb.group({
      appointmentId: [a.appointmentId, Validators.required],
      appointmentDate: [a.appointmentDate, Validators.required],
      appointmentStatus: [a.appointmentStatus, Validators.required],
      doctor: [a.doctor, Validators.required], // Doar ID-ul
    });

    this.defaultDoctor = this.updateAppointmentFormGroup.controls['doctor'].value;
    this.modalService.open(updateContent, {size:'xl'});
  }


  onUpdateAppointment(updateModal: any) {
    this.submitted = true;
    if (this.updateAppointmentFormGroup.invalid) return;

    const appointment = {
      appointmentId: this.updateAppointmentFormGroup.value.appointmentId,
      appointmentDate: this.updateAppointmentFormGroup.value.appointmentDate,
      status: this.updateAppointmentFormGroup.value.appointmentStatus,
      doctor: { doctorId: this.updateAppointmentFormGroup.value.doctor?.doctorId },
      patient: { patientId: this.updateAppointmentFormGroup.value.patient?.patientId }
    };
    this.appointmentService.updateAppointment(appointment, appointment.appointmentId).subscribe({
      next:() =>{
        alert("succes updating Appointment");
        this.handleSearchPatientAppointments();
        this.submitted=false;
        updateModal.close();

      }, error: err => {
        alert(err.message)
      }
    })
  }

  handleDeleteAppointment(a: Appointment) {
    let conf = confirm ("Are you sure?")
    if(!conf) return;
    this.appointmentService.deleteAppointment(a.appointmentId).subscribe({
      next:() =>{
        this.handleSearchPatientAppointments();
      },
      error:err => {
        alert(err.message)
        console.log(err)
      }
    })
  }


}
