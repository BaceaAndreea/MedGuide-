import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DoctorsService} from '../../services/doctors.service';
import {catchError, map, Observable, throwError} from 'rxjs';
import {PageRespone} from '../../model/page.response.model';
import {Doctor} from '../../model/doctor.model';
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
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
    NgClass,
    DatePipe
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

  totalDoctors: number = 0;
  totalSpecializations: number = 0;
  totalHospitals: number = 0;


  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private doctorService: DoctorsService,
    private hospitalService: HospitalsService,
    private specializationService: SpecializationsService,
    private userService: UsersService,
    private appointmentService: AppointmentsService
  ) {}

  ngOnInit(): void {
    // Inițializăm formularul de căutare
    this.searchFormGroup = this.fb.group({
      keyword: this.fb.control('')
    });

    // Inițializăm formularul pentru adăugare doctor
    this.doctorFormGroup = this.fb.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      birthDate: [null, Validators.required],
      hospital: [null, Validators.required],
      specialization: [null, Validators.required],
      user: this.fb.group({
        email: [
          "",
          [Validators.required, Validators.email],
          [EmailExistsValidators.validate(this.userService)]
        ],
        password: ["", [Validators.required, Validators.minLength(6)]]
      })
    });

    // Încărcăm datele inițiale
    this.handleSearchDoctors();
    this.loadDashboardData();
  }

  // Returneazp clasa pentru status badge în modală
  getStatusClass(status: string): string {
    if (status === 'Confirmată') return 'status-confirmed';
    if (status === 'Finalizată') return 'status-completed';
    if (status === 'Anulată') return 'status-cancelled';
    if (status === 'Programată') return 'status-scheduled';
    return 'status-pending';
  }

  // Încarcă datele sumare pentru dashboard
  loadDashboardData(): void {
    // Obținem numărul total de doctori
    this.doctorService.searchDoctors("", 0, 1000).pipe(
      map(page => {
        this.totalDoctors = page.totalElements;
        return page;
      }),
      catchError(err => {
        console.error('Eroare la încărcarea numărului de doctori', err);
        return throwError(err);
      })
    ).subscribe();

    // Obținem numărul total de specializări
    this.specializationService.findAllSpecializations().pipe(
      map(specializations => {
        this.totalSpecializations = specializations.length;
        return specializations;
      }),
      catchError(err => {
        console.error('Eroare la încărcarea specializărilor', err);
        return throwError(err);
      })
    ).subscribe();

    // Obținem numărul total de spitale
    this.hospitalService.findAllHospitals().pipe(
      map(hospitals => {
        this.totalHospitals = hospitals.length;
        return hospitals;
      }),
      catchError(err => {
        console.error('Eroare la încărcarea spitalelor', err);
        return throwError(err);
      })
    ).subscribe();

  }

  // Deschide modalul pentru adăugare doctor
  getModal(content: any): void {
    this.submitted = false;
    this.fetchHospitals();
    this.fetchSpecializations();
    this.modalService.open(content, {size: 'xl'});
  }

  // Caută doctori
  handleSearchDoctors(): void {
    const keyword = this.searchFormGroup.value.keyword;
    this.pageDoctors = this.doctorService.searchDoctors(keyword, this.currentPage, this.pageSize).pipe(
      catchError(err => {
        this.errorMessage = err.message;
        return throwError(err);
      })
    );
  }

  // Navigare paginare
  gotoPage(page: number): void {
    this.currentPage = page;
    this.handleSearchDoctors();
  }

  // Încarcă lista de spitale
  fetchHospitals(): void {
    this.hospitals$ = this.hospitalService.findAllHospitals().pipe(
      catchError(err => {
        this.errorMessageHospital = err.message;
        return throwError(err);
      })
    );
  }

  // Încarcă lista de specializări
  fetchSpecializations(): void {
    this.specializations$ = this.specializationService.findAllSpecializations().pipe(
      catchError(err => {
        this.errorMessageSpecialization = err.message;
        return throwError(err);
      })
    );
  }

  // Șterge un doctor
  handleDeleteDoctor(d: Doctor): void {
    const conf = confirm("Sunteți sigur că doriți să ștergeți acest doctor?");
    if (!conf) return;

    this.doctorService.deleteDoctor(d.doctorId).subscribe({
      next: () => {
        this.handleSearchDoctors();
        this.loadDashboardData(); // Actualizează sumarul
        alert("Doctorul a fost șters cu succes!");
      },
      error: err => {
        alert("Eroare la ștergerea doctorului: " + err.message);
        console.error(err);
      }
    });
  }

  // Închide modalul
  onCloseModal(modal: any): void {
    modal.close();
    this.doctorFormGroup.reset();
  }

  onSaveDoctor(modal: any): void {
    this.submitted = true;

    if (this.doctorFormGroup.invalid) {
      return;
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

    this.doctorService.saveDoctor(doctor).subscribe({
      next: () => {
        alert("Doctor salvat cu succes!");
        this.handleSearchDoctors();
        this.loadDashboardData(); // Actualizează sumarul
        this.submitted = false;
        this.doctorFormGroup.reset();
        modal.close();
      },
      error: err => {
        alert("Eroare la salvarea doctorului: " + err.message);
        console.error("Eroare salvare:", err);
      }
    });
  }

  // Deschide modalul pentru actualizare doctor
  getUpdateDoctorModal(d: Doctor, updateContent: any): void {
    this.fetchHospitals();
    this.fetchSpecializations();
    this.submitted = false;

    // Populăm formularul cu datele existente ale doctorului
    this.updateDoctorFormGroup = this.fb.group({
      doctorId: [d.doctorId, Validators.required],
      firstName: [d.firstName, Validators.required],
      lastName: [d.lastName, Validators.required],
      birthDate: [d.birthDate, Validators.required],
      hospital: [d.hospital?.hospitalId, Validators.required], // Doar ID-ul
      specialization: [d.specialization?.specializationId, Validators.required] // Doar ID-ul
    });

    this.modalService.open(updateContent, { size: 'xl' });
  }

  // Actualizează un doctor
  onUpdateDoctor(updateModal: any): void {
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
        alert("Doctor actualizat cu succes!");
        this.handleSearchDoctors();
        this.loadDashboardData(); // Actualizează sumarul
        this.submitted = false;
        updateModal.close();
      },
      error: err => {
        alert("Eroare la actualizarea doctorului: " + err.message);
      }
    });
  }

  // Deschide modalul pentru programările doctorului
  getAppointmentModal(d: Doctor, appointmentContent: any): void {
    this.appointmentCurrentPage = 0;
    this.modalDoctor = d;
    this.handleSearchAppointments(d);
    this.modalService.open(appointmentContent, {size: 'xl'});
  }

  // Caută programările unui doctor
  handleSearchAppointments(d: Doctor): void {
    this.pageAppointment$ = this.appointmentService.getAppointmentByDoctor(d.doctorId, this.appointmentCurrentPage, this.appointmentPageSize).pipe(
      catchError(err => {
        this.appointmentErrorMessage = err.message;
        return throwError(err);
      })
    );
  }

  // Navigare între paginile programărilor unui doctor
  gotoAppointmentsPage(page: number): void {
    this.appointmentCurrentPage = page;
    this.handleSearchAppointments(this.modalDoctor);
  }
}
