import {Component, inject} from '@angular/core';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Patient} from '../../model/patient.model';
import {catchError, Observable, throwError} from 'rxjs';
import {PageRespone} from '../../model/page.response.model';
import {Appointment} from '../../model/appointment.model';
import {Doctor} from '../../model/doctor.model';
import {ActivatedRoute} from '@angular/router';
import {AppointmentsService} from '../../services/appointments.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DoctorsService} from '../../services/doctors.service';
import {PatientsService} from '../../services/patients.service';
import {Hospital} from '../../model/hospital.model';
import {Specialization} from '../../model/specialization.model';

@Component({
  selector: 'app-appointments-doctor',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgForOf,
    NgClass,
    ReactiveFormsModule
  ],
  templateUrl: './appointments-doctor.component.html',
  styleUrl: './appointments-doctor.component.scss'
})
export class AppointmentsDoctorComponent {

  doctorId!: number;
  currentDoctor!: Doctor;
  pageAppointments$!: Observable<PageRespone<Appointment>>;
  currentPage: number = 0;
  pageSize : number= 5;
  errorMessage !: string;
  appointmentFormGroup!:FormGroup;
  submitted:boolean = false;
  patients$!:Observable<Array<Patient>>;
  errorMessagePatient!: string;
  updateAppointmentFormGroup!:FormGroup;
  defaultPatient!: Patient;

  private appointmentService = inject(AppointmentsService);

  constructor(private route : ActivatedRoute, private fb : FormBuilder,
              private modalService : NgbModal, private patientService : PatientsService) {}


  fetchPatients() {
    this.patients$ = this.patientService.findAllPatients().pipe(
      catchError(err => {
        this.errorMessagePatient = err.message;
        return throwError(err);
      })
    )
  }



  ngOnInit(): void {
    this.doctorId = this.route.snapshot.params['id'];
    this.fillCurrentDoctor();
    this.handleSearchDoctorAppointments();
  }

  private fillCurrentDoctor() {
    this.currentDoctor = {
      doctorId : this.doctorId,
      firstName: "",
      lastName: "",
      birthDate: new Date(),
      hospital: {} as Hospital,
      specialization: {} as Specialization,
      user:{email: "", password: ""}
    }
  }


  private handleSearchDoctorAppointments() {
    this.pageAppointments$ = this.appointmentService.getAppointmentByDoctor(this.doctorId, this.currentPage, this.pageSize)
      .pipe(
        catchError(err => {
          this.errorMessage = err.message;
          return throwError(err);
        })
      );
  }


  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchDoctorAppointments();

  }

  getModal(content: any) {
    this.submitted=false;
    this.appointmentFormGroup = this.fb.group({
      appointmentDate: [null, Validators.required],
      appointmentStatus: ["", Validators.required],
      doctor: [this.currentDoctor, Validators.required],
      patient: [null, Validators.required]
    })
    this.fetchPatients();
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
      doctor: { doctorId: this.currentDoctor?.doctorId }, //trimitem id-ul
      patient: { patientId: this.appointmentFormGroup.value.patient?.patientId }
    };

    this.appointmentService.saveAppointment(appointment).subscribe({
      next: () => {
        alert("Success Saving Appointment");
        setTimeout(() => this.handleSearchDoctorAppointments(), 500);
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
    this.fetchPatients();

    this.updateAppointmentFormGroup = this.fb.group({
      appointmentId: [a.appointmentId, Validators.required],
      appointmentDate: [a.appointmentDate, Validators.required],
      appointmentStatus: [a.appointmentStatus, Validators.required],
      patient: [a.patient, Validators.required]
    });

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
        this.handleSearchDoctorAppointments();
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
        this.handleSearchDoctorAppointments();
      },
      error:err => {
        alert(err.message)
        console.log(err)
      }
    })
  }


}
