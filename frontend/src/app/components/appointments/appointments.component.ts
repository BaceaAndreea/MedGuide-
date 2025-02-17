import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AsyncPipe, CommonModule, NgForOf, NgIf} from '@angular/common';
import {AppointmentsService} from '../../services/appointments.service';
import {catchError, Observable, throwError} from 'rxjs';
import {PageRespone} from '../../model/page.response.model';
import {Appointment} from '../../model/appointment.model';
import {DoctorsService} from '../../services/doctors.service';
import {Doctor} from '../../model/doctor.model';
import {NgbModal, NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {PatientsService} from '../../services/patients.service';
import {Patient} from '../../model/patient.model';


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
  appointmentFormGroup!:FormGroup;
  updateAppointmentFormGroup!:FormGroup;
  //$ - indica faptul că variabila este un Observable.
  pageAppointment$!:Observable<PageRespone<Appointment>>;
  doctors$!:Observable<Array<Doctor>>;
  patients$!:Observable<Array<Patient>>;
  currentPage: number = 0;
  pageSize: number = 5;
  errorMessage!: string;
  errorMessageDoctor!: string;
  errorMessagePatient!:string;
  submitted:boolean=false;
  defaultDoctor!: Doctor;
  defaultPatient!: Patient;

  constructor(private modalService: NgbModal,private fb: FormBuilder, private appointmentService : AppointmentsService, private doctorService: DoctorsService, private patientService : PatientsService) { }

  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword: this.fb.control('')
    })
    this.appointmentFormGroup=this.fb.group({
      appointmentDate: [null, Validators.required],
      appointmentStatus: ["", Validators.required],
      doctor: [null, Validators.required],
      patient: [null, Validators.required]
    })

    this.handleSearchAppointments()
  }


  // Deschide modalul
  openModal(content: any){
    this.submitted=false;
    this.fetchDoctors();
    this.fetchPatients();
    this.modalService.open(content, { size: 'lg', backdrop: 'static' });
  }

  handleSearchAppointments() {
    const keyword = this.searchFormGroup.get('keyword')?.value || '';
    this.pageAppointment$ = this.appointmentService.searchAppointments(keyword, this.currentPage, this.pageSize).pipe(
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
    let conf = confirm ("Are you sure?")
    if(!conf) return;
    this.appointmentService.deleteAppointment(a.appointmentId).subscribe({
      next:() =>{
        this.handleSearchAppointments();
      },
      error:err => {
        alert(err.message)
        console.log(err)
      }
    })
  }

  fetchDoctors() {
    this.doctors$ = this.doctorService.findAllDoctors().pipe(
      catchError(err => {
        this.errorMessageDoctor = err.message;
        return throwError(err);
      })
    )
  }

  fetchPatients() {
    this.patients$ = this.patientService.findAllPatients().pipe(
      catchError(err => {
        this.errorMessagePatient = err.message;
        return throwError(err);
      })
    )
  }

  onCloseModel(modal: any) {
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
      patient: { patientId: this.appointmentFormGroup.value.patient?.patientId }
    };

    this.appointmentService.saveAppointment(appointment).subscribe({
      next: () => {
        alert("Success Saving Appointment");
        this.handleSearchAppointments();
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
    this.fetchPatients();
    this.updateAppointmentFormGroup = this.fb.group({
      appointmentId: [a.appointmentId, Validators.required],
      appointmentDate: [a.appointmentDate, Validators.required],
      appointmentStatus: [a.appointmentStatus, Validators.required],
      doctor: [a.doctor, Validators.required], // Doar ID-ul
      patient: [a.patient, Validators.required] // Doar ID-ul
    });

    this.defaultDoctor = this.updateAppointmentFormGroup.controls['doctor'].value;
    this.defaultPatient = this.updateAppointmentFormGroup.controls['patient'].value;
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
        this.handleSearchAppointments();
        this.submitted=false;
        updateModal.close();

      }, error: err => {
        alert(err.message)
      }
    })
  }
}
