import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DoctorsService} from '../../services/doctors.service';
import {catchError, Observable, throwError} from 'rxjs';
import {PageRespone} from '../../model/page.response.model';
import {Doctor} from '../../model/doctor.model';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {Hospital} from '../../model/hospital.model';
import {Specialization} from '../../model/specialization.model';
import {HospitalsService} from '../../services/hospitals.service';
import {SpecializationsService} from '../../services/specializations.service';
import {Patient} from '../../model/patient.model';
import {EmailExistsValidators} from '../../validators/emailexists.validators';
import {UsersService} from '../../services/users.service';
import {AppointmentsService} from '../../services/appointments.service';
import {Appointment} from '../../model/appointment.model';

@Component({
  selector: 'app-doctors',
  standalone: true,
  templateUrl: './doctors.component.html',
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    NgForOf,
    NgIf,
    NgClass
  ],
  styleUrls: ['./doctors.component.scss']
})
export class DoctorsComponent implements OnInit{
  searchFormGroup!: FormGroup;
  updateDoctorFormGroup!:FormGroup;
  pageDoctors!:Observable<PageRespone<Doctor>>
  pageAppointment$!:Observable<PageRespone<Appointment>>;
  currentPage : number = 0;
  pageSize : number = 5;
  appointmentCurrentPage: number =0;
  appointmentPageSize : number =5;
  errorMessage!: String;
  appointmentErrorMessage!: String;
  hospitals$!:Observable<Array<Hospital>>;
  specializations$!:Observable<Array<Specialization>>
  doctorFormGroup!: FormGroup;
  submitted : boolean = false;
  errorMessageHospital!: string;
  errorMessageSpecialization!: string;
  defaultHospital!: Hospital;
  defaultSpecialization!: Specialization;
  modalDoctor!:Doctor;


  constructor(private modalService : NgbModal, private fb:FormBuilder, private doctorService : DoctorsService, private hospitalService : HospitalsService ,
              private specializationService : SpecializationsService, private userService : UsersService, private appointmentService : AppointmentsService) {}
  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword : this.fb.control('')
    })

    this.doctorFormGroup = this.fb.group({
      firstName:["", Validators.required],
      lastName:["", Validators.required],
      birthDate:[null, Validators.required],
      hospital:[null, Validators.required],
      specialization:[null, Validators.required],
      user: this.fb.group({
        email:["",
          [Validators.required, Validators.email],
          [EmailExistsValidators.validate(this.userService)] // Mută validatorul asincron într-un array separat
        ],
        password:["", [Validators.required, Validators.minLength(6)]]
      })
    })

    this.handleSearchDoctors();
  }

  getModal(content : any){
    this.submitted=false;
    this.fetchHospitals();
    this.fetchSpecializations();
    this.modalService.open(content, {size: 'xl'})

  }

  handleSearchDoctors() {
    let keyword = this.searchFormGroup.value.keyword
    this.pageDoctors = this.doctorService.searchDoctors(keyword, this.currentPage, this.pageSize).pipe(
      catchError(err => {
        this.errorMessage = err.message;
        return throwError(err);
      })
    );
  }

  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchDoctors();

  }

  fetchHospitals() {
    this.hospitals$ = this.hospitalService.findAllHospitals().pipe(
      catchError(err => {
        this.errorMessageHospital = err.message;
        return throwError(err);
      })
    )
  }

  fetchSpecializations() {
    this.specializations$ = this.specializationService.findAllSpecializations().pipe(
      catchError(err => {
        this.errorMessageSpecialization = err.message;
        return throwError(err);
      })
    )
  }


  handleDeleteDoctor(d: Doctor) {
    let conf = confirm("Are you sure?");
    if(!conf) return;
    this.doctorService.deleteDoctor(d.doctorId).subscribe({
      next:() => {
        this.handleSearchDoctors();
      },
      error: err => {
        alert(err.message);
        console.log(err);
      }
    })
  }

  onCloseModal(modal: any) {
    modal.close();
    this.doctorFormGroup.reset();
  }

  onSaveDoctor(modal: any) {
    this.submitted = true; // Marchează formularul ca fiind trimis

    if (this.doctorFormGroup.invalid) {
      console.log("Form is invalid", this.doctorFormGroup.errors);
      return; // Oprește execuția dacă formularul are erori
    }

    // Construim obiectul Doctor pentru a-l trimite către backend
    const doctor = {
      firstName: this.doctorFormGroup.value.firstName,
      lastName: this.doctorFormGroup.value.lastName,
      birthDate: this.doctorFormGroup.value.birthDate,
      hospital: { hospitalId: this.doctorFormGroup.value.hospital.hospitalId },
      specialization: { specializationId: this.doctorFormGroup.value.specialization.specializationId },
      user: {
        email: this.doctorFormGroup.value.user.email,
        password: this.doctorFormGroup.value.user.password
      }
    };

    console.log("Submitting doctor:", doctor);

    this.doctorService.saveDoctor(doctor).subscribe({
      next: () => {
        alert("Doctor saved successfully");
        this.handleSearchDoctors(); // Reîncarcă lista doctorilor
        this.submitted = false; // Resetăm starea formularului
        this.doctorFormGroup.reset(); // Resetăm formularul
        modal.close(); // Închidem modalul
      },
      error: err => {
        alert("Error saving doctor: " + err.message);
        console.error("Save error:", err);
      }
    });
  }


  getUpdateDoctorModal(d: Doctor, updateContent: any) {
    this.fetchHospitals();
    this.fetchSpecializations();

    // Populăm formularul cu datele existente ale doctorului (fără email și parolă)
    this.updateDoctorFormGroup = this.fb.group({
      doctorId: [d.doctorId, Validators.required],
      firstName: [d.firstName, Validators.required],
      lastName: [d.lastName, Validators.required],
      birthDate: [d.birthDate, Validators.required],
      hospital: [d.hospital?.hospitalId, Validators.required], // Doar ID-ul
      specialization: [d.specialization?.specializationId, Validators.required] // Doar ID-ul
    });

    this.defaultHospital = this.updateDoctorFormGroup.controls['hospital'].value;
    this.defaultSpecialization = this.updateDoctorFormGroup.controls['specialization'].value;

    this.modalService.open(updateContent, { size: 'xl' });
  }


  onUpdateDoctor(updateModal: any) {
    this.submitted = true;
    if (this.updateDoctorFormGroup.invalid) return;

    const doctor = {
      doctorId: this.updateDoctorFormGroup.value.doctorId,
      firstName: this.updateDoctorFormGroup.value.firstName,
      lastName: this.updateDoctorFormGroup.value.lastName,
      birthDate: this.updateDoctorFormGroup.value.birthDate,
      hospital: { hospitalId: this.updateDoctorFormGroup.value.hospital }, // Trimitem doar ID-ul
      specialization: { specializationId: this.updateDoctorFormGroup.value.specialization } // Trimitem doar ID-ul
    };

    this.doctorService.updateDoctor(doctor, doctor.doctorId).subscribe({
      next: () => {
        alert("Success updating Doctor");
        this.handleSearchDoctors(); // Reîncarcă lista doctorilor
        this.submitted = false;
        updateModal.close(); // Închide modalul
      },
      error: err => {
        alert("Error updating doctor: " + err.message);
      }
    });
  }



  getAppointmentModal(d: Doctor, appointmentContent: any) {
    this.appointmentCurrentPage =0 ;
    this.modalDoctor = d;
    this.handleSearchAppointments(d);
    this.modalService.open(appointmentContent, {size:'xl'});

  }

  handleSearchAppointments(d: Doctor) {
    this.pageAppointment$ = this.appointmentService.getAppointmentByDoctor(d.doctorId, this.appointmentCurrentPage, this.appointmentPageSize).pipe(
      catchError( err => {
        this.appointmentErrorMessage = err.message;
        return throwError(err);
      })
    )
  }

  gotoAppointmentsPage(page: number) {
    this.appointmentCurrentPage = page;
    this.handleSearchAppointments(this.modalDoctor);

  }
}
