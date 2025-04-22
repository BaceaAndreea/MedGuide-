import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LoggedUser } from '../../model/logged-user.model';
import {NgIf, NgClass, AsyncPipe, NgForOf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DoctorsService} from '../../services/doctors.service';
import {SpecializationsService} from '../../services/specializations.service';
import {HospitalsService} from '../../services/hospitals.service';
import {PatientsService} from '../../services/patients.service';
import {Doctor} from '../../model/doctor.model';
import {Patient} from '../../model/patient.model';
import {Hospital} from '../../model/hospital.model';
import {Specialization} from '../../model/specialization.model';
import {LanguageSelectorComponent} from '../language-selector/language-selector.component';
import {TranslateModule} from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgIf,
    NgClass,
    AsyncPipe,
    NgForOf,
    ReactiveFormsModule,
    LanguageSelectorComponent,
    TranslateModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  userSub!: Subscription;
  isAuthenticated = false;
  isAdmin = false;
  isDoctor = false;
  isPatient = false;
  doctorId: number | undefined;
  patientId: number | undefined;

  // New properties for enhanced UI
  isCollapsed = false;
  showUserMenu = false;
  userName = '';
  userRole = '';
  activeRoute = '';
  displayName = '';

  updateDoctorFormGroup!: FormGroup;
  updatePatientFormGroup!: FormGroup;
  submitted = false;
  currentDoctor!: Doctor | undefined;
  currentPatient!: Patient | undefined;
  hospitals$!: Observable<Array<Hospital>>;
  specializations$!: Observable<Array<Specialization>>;
  name!: string | undefined;



  constructor(
    private authService: AuthService,
    private router: Router, private fb : FormBuilder, private modalService: NgbModal,
    private doctorService : DoctorsService, private specializationService : SpecializationsService,
    private hospitalService : HospitalsService, private patientService : PatientsService
  ) { }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(data => {
      this.isAuthenticated = !!data;
      if (!this.isAuthenticated) {
        this.initializeState();
      } else if (!!data) {
        this.setRole(data);

        // Setează numele complet
        if (this.isDoctor) {
          this.userName = data.doctor?.firstName + " " + data.doctor?.lastName;
          this.currentDoctor = data.doctor;
        } else if (this.isPatient) {
          this.userName = data.patient?.firstName + " " + data.patient?.lastName;
          this.currentPatient = data.patient;
        } else if (this.isAdmin) {
          this.userName = "Admin";
        } else {
          this.userName = data.username || 'User';
        }
      }
    });
    this.hospitals$ = this.hospitalService.findAllHospitals();
    this.specializations$ = this.specializationService.findAllSpecializations();

    this.router.events.subscribe((event: any) => {
      if (event.constructor.name === 'NavigationEnd') {
        this.activeRoute = event.url;
      }
    });
  }


  getModal(content: any) {
    this.modalService.open(content, { size: 'xl' });

    if (this.isDoctor && this.currentDoctor) {
      this.updateDoctorFormGroup = this.fb.group({
        doctorId: [this.currentDoctor.doctorId, Validators.required],
        firstName: [this.currentDoctor.firstName, Validators.required],
        lastName: [this.currentDoctor.lastName, Validators.required],
        birthDate: [this.currentDoctor.birthDate, Validators.required],
        hospital: [this.currentDoctor.hospital?.hospitalId, Validators.required],
        specialization: [this.currentDoctor.specialization?.specializationId, Validators.required]
      });
    }

    if (this.isPatient && this.currentPatient) {
      this.updatePatientFormGroup = this.fb.group({
        patientId: [this.currentPatient.patientId, Validators.required],
        firstName: [this.currentPatient.firstName, Validators.required],
        lastName: [this.currentPatient.lastName, Validators.required],
        medicalHistory: [{ value: this.currentPatient.medicalHistory?.join(", "), disabled: true }],
        allergies: [this.currentPatient.allergies?.join(", ")]
      });
    }
  }

  onUpdateDoctor(modal: any) {
    this.submitted = true;
    if (this.updateDoctorFormGroup.invalid) return;

    const updatedDoctor = {
      doctorId: this.updateDoctorFormGroup.value.doctorId,
      firstName: this.updateDoctorFormGroup.value.firstName,
      lastName: this.updateDoctorFormGroup.value.lastName,
      birthDate: this.updateDoctorFormGroup.value.birthDate,
      hospital: { hospitalId: this.updateDoctorFormGroup.value.hospital },
      specialization: { specializationId: this.updateDoctorFormGroup.value.specialization }
    };

    this.doctorService.updateDoctor(updatedDoctor, updatedDoctor.doctorId).subscribe({
      next: (doctor) => {
        alert("Profil actualizat cu succes");
        this.authService.refreshDoctor(doctor);
        this.submitted = false;
        modal.close();
        this.showUserMenu = false;
      },
      error: (err) => alert(err.message)
    });
  }

  onUpdatePatient(modal: any) {
    this.submitted = true;
    if (this.updatePatientFormGroup.invalid) return;


    const allergiesString = this.updatePatientFormGroup.value.allergies || '';
    const allergiesArray = allergiesString.split(',')
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);

    const updatedPatient = {
      patientId: this.updatePatientFormGroup.value.patientId,
      firstName: this.updatePatientFormGroup.value.firstName,
      lastName: this.updatePatientFormGroup.value.lastName,
      medicalHistory: this.currentPatient?.medicalHistory,
      allergies: allergiesArray  // Trimitem array, nu string
    };

    this.patientService.updatePatient(updatedPatient, updatedPatient.patientId).subscribe({
      next: (patient) => {
        alert('Profil actualizat cu succes');
        this.authService.refreshPatient(patient);
        this.submitted = false;
        modal.close();
        this.showUserMenu = false;
      },
      error: err => alert('Eroare la actualizare: ' + err.message)
    });
  }

  onCloseModal(modal: any) {
    modal.close();
  }




  setRole(loggedUser: LoggedUser | null) {
    if (loggedUser?.roles.includes("Admin")) {
      this.isAdmin = true;
      this.userRole = 'Administrator';
      this.displayName = loggedUser?.username ?? '';
    } else if (!!loggedUser?.doctor) {
      this.isDoctor = true;
      this.doctorId = loggedUser.doctor?.doctorId;
      this.userRole = 'Doctor';
      this.displayName = `${loggedUser.doctor?.firstName} ${loggedUser.doctor?.lastName}`;
    } else if (!!loggedUser?.patient) {
      this.isPatient = true;
      this.patientId = loggedUser.patient?.patientId;
      this.userRole = 'Pacient';
      this.displayName = `${loggedUser.patient?.firstName} ${loggedUser.patient?.lastName}`;
    }
  }


  initializeState() {
    this.isAdmin = false;
    this.isDoctor = false;
    this.isPatient = false;
    this.userRole = '';
    this.userName = '';
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    console.log('Sidebar collapsed:', this.isCollapsed); // adaugă acest log pentru debug
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  navigateToProfile() {
    // Implement navigation to profile page
    this.showUserMenu = false;
    //this.router.navigate(['/profile']);
  }

  logout() {
    // Call your auth service logout method
    this.authService.logout();
    this.showUserMenu = false;
    this.router.navigate(['/auth']);
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}
