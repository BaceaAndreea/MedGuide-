import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AsyncPipe, CommonModule, NgForOf, NgIf} from '@angular/common';
import {AppointmentsService} from '../../services/appointments.service';
import {catchError, Observable, throwError} from 'rxjs';
import {PageRespone} from '../../model/page.response.model';
import {Appointment} from '../../model/appointment.model';


@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    AsyncPipe,
    NgForOf,
    CommonModule,


  ],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss'
})
export class AppointmentsComponent implements OnInit{

  searchFormGroup!: FormGroup;
  appointmentFormGroup!:FormGroup;
  //$ - indica faptul că variabila este un Observable.
  pageAppointment$!:Observable<PageRespone<Appointment>>;
  currentPage: number = 0;
  pageSize: number = 5;
  errorMessage!: string;

  constructor(private fb: FormBuilder, private appointmentService : AppointmentsService) { }

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

  showModal: boolean = false;

  // Deschide modalul
  openModal(): void {
    this.showModal = true;
  }

  // Închide modalul
  closeModal(): void {
    this.showModal = false;
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
}
