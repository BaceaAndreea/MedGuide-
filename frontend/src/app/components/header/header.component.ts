import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {first, Observable, Subscription} from 'rxjs';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {Doctor} from '../../model/doctor.model';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DoctorsService} from '../../services/doctors.service';
import {Hospital} from '../../model/hospital.model';
import {Specialization} from '../../model/specialization.model';
import {SpecializationsService} from '../../services/specializations.service';
import {HospitalsService} from '../../services/hospitals.service';
import {Patient} from '../../model/patient.model';
import {PatientsService} from '../../services/patients.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  imports: [
    RouterLink,
    NgIf,
    ReactiveFormsModule,
    NgClass,
    AsyncPipe,
    NgForOf
  ],
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit,  OnDestroy{

  userSub!: Subscription;
  isAuthenticated = false;
  isDoctor = false;
  isPatient = false;
  name!: string | undefined;
  currentDoctor !: Doctor | undefined;
  currentPatient!: Patient | undefined;
  updateDoctorFormGroup !: FormGroup;
  updatePatientFormGroup !: FormGroup;
  submitted: boolean=false;
  hospitals$!:Observable<Array<Hospital>>;
  specializations$!:Observable<Array<Specialization>>

  constructor(private authService : AuthService, private fb : FormBuilder, private modalService: NgbModal,
              private doctorService : DoctorsService, private specializationService : SpecializationsService,
              private hospitalService : HospitalsService, private patientService : PatientsService) { }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(loggedUser => {
      this.isAuthenticated = !!loggedUser; //will return true if the user existed and is logged in
      this.isDoctor = !!loggedUser?.doctor;
      this.isPatient = !!loggedUser?.patient;
      if(this.isDoctor) {
        this.name = loggedUser?.doctor?.firstName + " " +loggedUser?.doctor?.lastName;
        this.currentDoctor = loggedUser?.doctor;
      } else if(this.isPatient){
        this.name = loggedUser?.patient?.firstName + " " + loggedUser?.patient?.lastName;
        this.currentPatient = loggedUser?.patient;
      }
    })

    this.hospitals$ = this.hospitalService.findAllHospitals();
    this.specializations$ = this.specializationService.findAllSpecializations();
  }

  logout() {
    this.authService.logout();

  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  getModal(content : any) {
    this.modalService.open(content, {size: 'xl'})
    if(this.isDoctor){
      this.updateDoctorFormGroup = this.fb.group({
        doctorId : [this.currentDoctor?.doctorId, Validators.required],
        firstName : [this.currentDoctor?.firstName, Validators.required],
        lastName : [this.currentDoctor?.lastName, Validators.required],
        birthDate : [this.currentDoctor?.birthDate, Validators.required],
        hospital : [this.currentDoctor?.hospital?.hospitalId, Validators.required],
        specialization : [this.currentDoctor?.specialization?.specializationId, Validators.required] //
      })
    }

    if(this.isPatient){
      this.updatePatientFormGroup = this.fb.group({
        patientId : [this.currentPatient?.patientId, Validators.required],
        firstName : [this.currentPatient?.firstName, Validators.required],
        lastName : [this.currentPatient?.lastName, Validators.required],
        medicalHistory: [{ value: this.currentPatient?.medicalHistory?.join(", "), disabled: true }, Validators.required], // 🔹 Read-only
        allergies: [{ value: this.currentPatient?.allergies?.join(", "), disabled: true }, Validators.required] // 🔹 Read-only
      })

    }
  }

  onCloseModal(modal: any) {
    modal.close();

  }

  onUpdateDoctor(modal: any) {
    this.submitted = true;
    if (this.updateDoctorFormGroup.invalid) return;

    const updatedDoctor = {
      doctorId: this.updateDoctorFormGroup.value.doctorId,
      firstName: this.updateDoctorFormGroup.value.firstName,
      lastName: this.updateDoctorFormGroup.value.lastName,
      birthDate: this.updateDoctorFormGroup.value.birthDate,
      hospital: { hospitalId: this.updateDoctorFormGroup.value.hospital }, // Trimitere ca obiect cu ID
      specialization: { specializationId: this.updateDoctorFormGroup.value.specialization } // Trimitere ca obiect cu ID
    };

    this.doctorService.updateDoctor(updatedDoctor, updatedDoctor.doctorId).subscribe({
      next: (doctor) => {
        alert("Success Updating Profile");
        this.authService.refreshDoctor(doctor)
        this.submitted = false;
        modal.close();
      },
      error: (err) => {
        alert(err.message);
      }
    });
  }

  onUpdatePatient(modal: any) {
    this.submitted = true;

    if (this.updatePatientFormGroup.invalid) {
      console.log("Form is invalid:", this.updatePatientFormGroup.errors);
      return;
    }

    const updatedPatient = {
      patientId: this.updatePatientFormGroup.value.patientId,
      firstName: this.updatePatientFormGroup.value.firstName,
      lastName: this.updatePatientFormGroup.value.lastName,
      medicalHistory: this.currentPatient?.medicalHistory,
      allergies: this.currentPatient?.allergies
    };

    console.log("Submitting updated patient:", updatedPatient);

    this.patientService.updatePatient(updatedPatient, updatedPatient.patientId).subscribe({
      next: (patient) => {
        alert('Success updating Patient');
        this.authService.refreshPatient(patient)
        this.submitted = false;
        modal.close();
      },
      error: err => {
        console.log("Error updating patient:", err);
        alert('Error updating patient: ' + err.message);
      }
    });
  }

}
