import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Patient} from '../../model/patient.model';
import {catchError, Observable, tap, throwError} from 'rxjs';
import {PageRespone} from '../../model/page.response.model';
import {Appointment} from '../../model/appointment.model';
import {AppointmentsService} from '../../services/appointments.service';
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Doctor} from '../../model/doctor.model';
import {DoctorsService} from '../../services/doctors.service';
import { futureDateValidator} from '../../validators/date-validator';
import { Specialization } from '../../model/specialization.model';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-appointments-patient',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgForOf,
    NgClass,
    ReactiveFormsModule,
    DatePipe,
    TranslateModule
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
  specializations$!:Observable<Array<Specialization>>;
  filteredDoctors: Doctor[] = [];
  errorMessageDoctor!: string;
  updateAppointmentFormGroup!:FormGroup;
  defaultDoctor!: Doctor;
  totalAppointments: number = 0;
  upcomingAppointments: number = 0;
  completedAppointments: number = 0;
  canceledAppointments: number = 0;
  minDate!: string;
  currentDate: Date = new Date();
  private appointmentService = inject(AppointmentsService);
  currentLang: string = 'ro'; // Default language

  // PROPRIETĂȚI PENTRU SLOT-URI DE TIMP SIMPLE (pentru update)
  availableTimeSlots: string[] = [];
  loadingSlots: boolean = false;
  selectedDate: string = '';
  selectedTime: string = '';
  minDateString: string = '';

  // PROPRIETĂȚI NOI PENTRU CALENDAR SIMPLIFICAT
  currentSelectedDate: Date | null = null;
  currentDateTimeSlots: string[] = [];
  isLoadingCalendarSlots: boolean = false;
  filteredAppointmentTypes: string[] = [];

  constructor(
    private route : ActivatedRoute,
    private fb : FormBuilder,
    private modalService : NgbModal,
    private doctorService : DoctorsService,
    private translate: TranslateService // Inject TranslateService
  ) {
    // Initialize language
    this.translate.setDefaultLang('ro');
    this.translate.use(this.currentLang);

    // Subscribe to language changes
    this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
    });
  }

  fetchSpecializations() {
    this.specializations$ = this.doctorService.findAllSpecializations().pipe(
      catchError(err => {
        this.errorMessageDoctor = this.translate.instant('ERROR.FETCH_SPECIALIZATIONS') + ': ' + err.message;
        return throwError(err);
      })
    );
  }

  fetchDoctorsBySpecialization(specializationId: number | null | undefined) {
    if (!specializationId) {
      this.filteredDoctors = [];
      return;
    }

    this.doctorService.findDoctorsBySpecialization(specializationId).subscribe({
      next: (doctors) => {
        this.filteredDoctors = doctors;
        if (this.filteredDoctors.length === 0) {
          // If there are no doctors for this specialization, show a message
          this.errorMessageDoctor = this.translate.instant('ERROR.FETCH_DOCTORS') + ': ' +
            this.translate.instant('APPOINTMENTS.NO_APPOINTMENTS');
        } else {
          this.errorMessageDoctor = '';
        }
      },
      error: (err) => {
        this.errorMessageDoctor = this.translate.instant('ERROR.FETCH_DOCTORS') + ': ' + err.message;
        console.error(err);
      }
    });
  }

  fetchDoctors() {
    this.doctors$ = this.doctorService.findAllDoctors().pipe(
      catchError(err => {
        this.errorMessageDoctor = this.translate.instant('ERROR.FETCH_DOCTORS') + ': ' + err.message;
        return throwError(err);
      })
    )
  }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.params['id'];
    this.fillCurrentPatient();
    this.handleSearchPatientAppointments();

    const today = new Date();
    this.minDate = today.toISOString().slice(0, 16);
    this.minDateString = today.toISOString().split('T')[0];
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
          this.errorMessage = this.translate.instant('ERROR.FETCH_APPOINTMENTS') + ': ' + err.message;
          return throwError(err);
        }),
        tap(pageResponse => {
          this.calculateDashboardSummary(pageResponse.content);
        })
      );
  }

  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchPatientAppointments();
  }

  private subscriptions = new Subscription();

  // ==============================================
  // METODE PENTRU CALENDARUL SIMPLIFICAT
  // ==============================================

  // Inițializează calendarul cu ziua curentă
  initializeSimpleCalendar(): void {
    const today = new Date();
    // Găsește următoarea zi lucrătoare (nu weekend)
    while (today.getDay() === 0 || today.getDay() === 6) {
      today.setDate(today.getDate() + 1);
    }

    this.currentSelectedDate = new Date(today);

    // Sincronizează formControl-ul cu data selectată
    const dateStr = this.currentSelectedDate.toISOString().split('T')[0];
    this.appointmentFormGroup.get('appointmentDate')?.setValue(dateStr);

    // Încarcă slot-urile pentru ziua curentă
    const doctorControl = this.appointmentFormGroup.get('doctor');
    if (doctorControl?.value) {
      this.loadCurrentDateTimeSlots(doctorControl.value.doctorId);
    }
  }

  // Verifică dacă suntem la data minimă (azi sau prima zi lucrătoare)
  isAtMinDate(): boolean {
    if (!this.currentSelectedDate) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Găsește prima zi lucrătoare de la azi înainte
    let minWorkDay = new Date(today);
    while (minWorkDay.getDay() === 0 || minWorkDay.getDay() === 6) {
      minWorkDay.setDate(minWorkDay.getDate() + 1);
    }

    this.currentSelectedDate.setHours(0, 0, 0, 0);
    return this.currentSelectedDate.getTime() <= minWorkDay.getTime();
  }

  // Obține label-ul pentru data curentă
  getCurrentDateLabel(): string {
    if (!this.currentSelectedDate) return '';

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (this.currentSelectedDate.toDateString() === today.toDateString()) {
      const days = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
      const months = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'];
      return `${days[this.currentSelectedDate.getDay()]} ${this.currentSelectedDate.getDate()} ${months[this.currentSelectedDate.getMonth()]}`;
    } else if (this.currentSelectedDate.toDateString() === tomorrow.toDateString()) {
      return 'Mâine';
    } else {
      const days = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
      const months = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'];
      return `${days[this.currentSelectedDate.getDay()]} ${this.currentSelectedDate.getDate()} ${months[this.currentSelectedDate.getMonth()]}`;
    }
  }

  // Navighează la următoarea zi lucrătoare
  navigateCalendarNext(): void {
    if (!this.currentSelectedDate) return;

    let nextDate = new Date(this.currentSelectedDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Sări peste weekend-uri
    while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    this.currentSelectedDate = nextDate;
    this.selectedTime = '';

    // Sincronizează formControl-ul
    const dateStr = this.currentSelectedDate.toISOString().split('T')[0];
    this.appointmentFormGroup.get('appointmentDate')?.setValue(dateStr);

    // Încarcă slot-urile pentru noua dată
    const doctorControl = this.appointmentFormGroup.get('doctor');
    if (doctorControl?.value) {
      this.loadCurrentDateTimeSlots(doctorControl.value.doctorId);
    }
  }

  // Navighează la ziua lucrătoare anterioară
  navigateCalendarPrevious(): void {
    if (!this.currentSelectedDate || this.isAtMinDate()) return;

    let prevDate = new Date(this.currentSelectedDate);
    prevDate.setDate(prevDate.getDate() - 1);

    // Sări peste weekend-uri
    while (prevDate.getDay() === 0 || prevDate.getDay() === 6) {
      prevDate.setDate(prevDate.getDate() - 1);
    }

    // Nu permite să meargă înainte de azi
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (prevDate < today) {
      return;
    }

    this.currentSelectedDate = prevDate;
    this.selectedTime = '';

    // Sincronizează formControl-ul
    const dateStr = this.currentSelectedDate.toISOString().split('T')[0];
    this.appointmentFormGroup.get('appointmentDate')?.setValue(dateStr);

    // Încarcă slot-urile pentru noua dată
    const doctorControl = this.appointmentFormGroup.get('doctor');
    if (doctorControl?.value) {
      this.loadCurrentDateTimeSlots(doctorControl.value.doctorId);
    }
  }

  // Încarcă slot-urile pentru data curentă selectată
  private loadCurrentDateTimeSlots(doctorId: number): void {
    if (!this.currentSelectedDate) return;

    const dateString = this.currentSelectedDate.toISOString().split('T')[0];
    this.isLoadingCalendarSlots = true;
    this.currentDateTimeSlots = [];

    this.appointmentService.getAvailableTimeSlots(doctorId, dateString).subscribe({
      next: (slots) => {
        this.currentDateTimeSlots = slots;
        this.isLoadingCalendarSlots = false;
      },
      error: (err) => {
        console.error('Error loading time slots:', err);
        this.currentDateTimeSlots = [];
        this.isLoadingCalendarSlots = false;
      }
    });
  }

  // Selectează un slot de timp
  selectCalendarTimeSlot(timeSlot: string): void {
    this.selectedTime = timeSlot;
  }

  // Resetează calendarul simplificat
  private resetSimpleCalendar(): void {
    this.currentSelectedDate = null;
    this.currentDateTimeSlots = [];
    this.selectedTime = '';
  }

  // ==============================================
  // METODE PENTRU MODAL-URI
  // ==============================================

  getModal(content: any) {
    this.submitted = false;
    this.availableTimeSlots = [];
    this.selectedDate = '';
    this.selectedTime = '';
    this.currentDateTimeSlots = []; // Resetează slot-urile pentru calendar simplificat
    this.currentSelectedDate = null;


    this.appointmentFormGroup = this.fb.group({
      specialization: [null, Validators.required],
      doctor: [null, Validators.required],
      reason: [null, Validators.required], // SCHIMBĂ din "" în null pentru dropdown
      patient: [this.currentPatient, Validators.required]
    });

// Modifică subscription-ul pentru specialization:
    const specializationControl = this.appointmentFormGroup.get('specialization');
    if (specializationControl) {
      const subscription = specializationControl.valueChanges.pipe(
        filter((value: number | null | undefined) => value !== null && value !== undefined)
      ).subscribe(specializationId => {
        this.fetchDoctorsBySpecialization(specializationId);
        this.appointmentFormGroup.get('doctor')?.enable();
        this.appointmentFormGroup.get('doctor')?.setValue(null);
        this.appointmentFormGroup.get('reason')?.setValue(null); // RESETEAZĂ REASON

        // Găsește specializarea și încarcă tipurile
        const currentSpecializations = this.specializations$.subscribe(specializations => {
          const spec = specializations.find(s => s.specializationId === specializationId);
          if (spec) {
            this.getAppointmentTypesBySpecialization(spec.description);
          }
        });

        this.resetSimpleCalendar();
      });
      this.subscriptions.add(subscription);
    }

    // When doctor changes, initialize simple calendar
    const doctorControl = this.appointmentFormGroup.get('doctor');
    if (doctorControl) {
      const subscription = doctorControl.valueChanges.subscribe((doctor) => {
        if (doctor) {
          this.initializeSimpleCalendar();
        } else {
          this.resetSimpleCalendar();
        }
      });
      this.subscriptions.add(subscription);
    }

    this.fetchSpecializations();
    this.modalService.open(content, {size:'xl'}).result.then(
      () => {
        this.subscriptions.unsubscribe();
        this.subscriptions = new Subscription();
      },
      () => {
        this.subscriptions.unsubscribe();
        this.subscriptions = new Subscription();
      }
    );
  }

  onCloseModal(modal: any) {
    modal.close();
    this.appointmentFormGroup.reset();
    this.filteredDoctors = [];
    this.resetSimpleCalendar();
  }

  onSaveAppointment(modal: any) {
    this.submitted = true;

    if (this.appointmentFormGroup.invalid || !this.currentSelectedDate || !this.selectedTime) {
      if (!this.currentSelectedDate || !this.selectedTime) {
        alert(this.translate.instant('ERROR.PLEASE_SELECT_DATE_TIME') || 'Vă rugăm să selectați data și ora pentru programare');
      }
      return;
    }

    // MODIFICAREA PRINCIPALĂ - creează data fără conversie UTC
    const [hours, minutes] = this.selectedTime.split(':');
    const year = this.currentSelectedDate.getFullYear();
    const month = this.currentSelectedDate.getMonth();
    const day = this.currentSelectedDate.getDate();

    // Creează data în timezone-ul local
    const appointmentDateTime = new Date(year, month, day, parseInt(hours), parseInt(minutes), 0, 0);

    const selectedDoctor = this.appointmentFormGroup.value.doctor;

    const appointment = {
      // Formatează manual data pentru a evita conversiile UTC
      appointmentDate: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${this.selectedTime}:00`,
      status: "Confirmată",
      reason: this.appointmentFormGroup.value.reason,
      doctor: {
        doctorId: selectedDoctor.doctorId,
        firstName: selectedDoctor.firstName,
        lastName: selectedDoctor.lastName,
        email: selectedDoctor.email,
        specialization: selectedDoctor.specialization
      },
      patient: {
        patientId: this.currentPatient.patientId,
        firstName: this.currentPatient.firstName,
        lastName: this.currentPatient.lastName
      }
    };

    console.log('Data trimisă:', appointment.appointmentDate);
    console.log('Ora selectată:', this.selectedTime);

    this.appointmentService.saveAppointment(appointment).subscribe({
      next: (response) => {
        console.log('Appointment saved successfully:', response);
        alert(this.translate.instant('SUCCESS.APPOINTMENT_CREATED') || 'Programarea a fost creată cu succes');
        setTimeout(() => this.handleSearchPatientAppointments(), 500);
        this.appointmentFormGroup.reset();
        this.submitted = false;
        this.resetSimpleCalendar();
        modal.close();
      },
      error: (err) => {
        console.error('Save appointment error:', err);
        let errorMessage = this.translate.instant('ERROR.SAVE_APPOINTMENT') || 'Eroare la salvarea programării';

        // More detailed error handling
        if (err.error && err.error.message) {
          errorMessage += ': ' + err.error.message;
        } else if (err.message) {
          errorMessage += ': ' + err.message;
        } else if (err.status) {
          errorMessage += ' (Status: ' + err.status + ')';
        }

        alert(errorMessage);
      }
    });
  }

  getUpdateModal(a: any, updateContent: any) {
    this.fetchSpecializations();
    this.availableTimeSlots = [];
    this.selectedDate = '';
    this.selectedTime = '';

    let initialSpecializationId = a.doctor?.specialization?.specializationId;

    // Extrage data și ora din programarea existentă
    const appointmentDate = new Date(a.appointmentDate);
    const dateString = appointmentDate.toISOString().split('T')[0];
    const timeString = appointmentDate.toTimeString().substring(0, 5); // HH:mm

    this.selectedDate = dateString;
    this.selectedTime = timeString;

    this.updateAppointmentFormGroup = this.fb.group({
      appointmentId: [a.appointmentId, Validators.required],
      appointmentDate: [dateString, [Validators.required, futureDateValidator()]],
      specialization: [initialSpecializationId, Validators.required],
      doctor: [a.doctor, Validators.required],
      status: [a.status, Validators.required],
      reason: [a.reason, Validators.required],
    });

    // Load the doctors for the initial specialization
    if (initialSpecializationId) {
      this.fetchDoctorsBySpecialization(initialSpecializationId);
      // Load available time slots for the current doctor and date
      this.loadAvailableTimeSlots(a.doctor.doctorId, dateString);
    }

    // Listen for specialization changes
    const specializationControl = this.updateAppointmentFormGroup.get('specialization');
    if (specializationControl) {
      const subscription = specializationControl.valueChanges.pipe(
        filter((value: number | null | undefined) => value !== null && value !== undefined)
      ).subscribe(specializationId => {
        this.fetchDoctorsBySpecialization(specializationId);
        this.updateAppointmentFormGroup.get('doctor')?.setValue(null);
        this.availableTimeSlots = [];
        this.selectedTime = '';
      });
      this.subscriptions.add(subscription);
    }

    // Listen for doctor changes
    const doctorControl = this.updateAppointmentFormGroup.get('doctor');
    if (doctorControl) {
      const subscription = doctorControl.valueChanges.subscribe(() => {
        this.onUpdateDateOrDoctorChange();
      });
      this.subscriptions.add(subscription);
    }

    // Listen for date changes
    const dateControl = this.updateAppointmentFormGroup.get('appointmentDate');
    if (dateControl) {
      const subscription = dateControl.valueChanges.subscribe(() => {
        this.onUpdateDateOrDoctorChange();
      });
      this.subscriptions.add(subscription);
    }

    this.defaultDoctor = this.updateAppointmentFormGroup.controls['doctor'].value;
    this.modalService.open(updateContent, { size: 'xl' }).result.then(
      () => {
        this.subscriptions.unsubscribe();
        this.subscriptions = new Subscription();
      },
      () => {
        this.subscriptions.unsubscribe();
        this.subscriptions = new Subscription();
      }
    );
  }

  onUpdateDateOrDoctorChange(): void {
    const dateControl = this.updateAppointmentFormGroup?.get('appointmentDate');
    const doctorControl = this.updateAppointmentFormGroup?.get('doctor');

    if (!dateControl?.value || !doctorControl?.value) {
      this.availableTimeSlots = [];
      return;
    }

    const dateString = dateControl.value;
    this.selectedDate = dateString;
    this.loadAvailableTimeSlots(doctorControl.value.doctorId, dateString);
  }

  selectUpdateTimeSlot(timeSlot: string): void {
    this.selectedTime = timeSlot;
  }

  onUpdateAppointment(updateModal: any) {
    this.submitted = true;
    if (this.updateAppointmentFormGroup.invalid || !this.selectedTime) {
      return;
    }

    const selectedDate = this.updateAppointmentFormGroup.value.appointmentDate;

    if (!selectedDate || !this.selectedTime) {
      alert(this.translate.instant('ERROR.PLEASE_SELECT_DATE_TIME') || 'Vă rugăm să selectați data și ora pentru programare');
      return;
    }

    const appointmentDateTime = new Date(`${selectedDate}T${this.selectedTime}`);

    const appointment = {
      appointmentId: this.updateAppointmentFormGroup.value.appointmentId,
      appointmentDate: appointmentDateTime.toISOString(),
      status: this.updateAppointmentFormGroup.value.status,
      reason: this.updateAppointmentFormGroup.value.reason,
      doctor: { doctorId: this.updateAppointmentFormGroup.value.doctor?.doctorId },
      patient: { patientId: this.currentPatient?.patientId }
    };

    this.appointmentService.updateAppointment(appointment, appointment.appointmentId).subscribe({
      next: () => {
        alert(this.translate.instant('SUCCESS.APPOINTMENT_UPDATED') || 'Programarea a fost actualizată cu succes');
        this.handleSearchPatientAppointments();
        this.submitted = false;
        this.availableTimeSlots = [];
        this.selectedTime = '';
        updateModal.close();
      },
      error: err => {
        alert(this.translate.instant('ERROR.UPDATE_APPOINTMENT') + ': ' + err.message);
      }
    });
  }

  // ==============================================
  // METODE PENTRU SLOT-URI SIMPLE (UPDATE)
  // ==============================================

  onDateOrDoctorChange(): void {
    const appointmentDateControl = this.appointmentFormGroup?.get('appointmentDate');
    const doctorControl = this.appointmentFormGroup?.get('doctor');

    if (!appointmentDateControl?.value || !doctorControl?.value) {
      this.availableTimeSlots = [];
      return;
    }

    const dateString = appointmentDateControl.value;
    this.selectedDate = dateString;
    this.loadAvailableTimeSlots(doctorControl.value.doctorId, dateString);
  }

  private loadAvailableTimeSlots(doctorId: number, date: string): void {
    this.loadingSlots = true;
    this.availableTimeSlots = [];

    this.appointmentService.getAvailableTimeSlots(doctorId, date).subscribe({
      next: (slots) => {
        this.availableTimeSlots = slots;
        this.loadingSlots = false;

        if (this.selectedTime && !slots.includes(this.selectedTime)) {
          this.selectedTime = '';
        }
      },
      error: (err) => {
        console.error('Error loading time slots:', err);
        this.availableTimeSlots = [];
        this.loadingSlots = false;
      }
    });
  }

  selectTimeSlot(timeSlot: string): void {
    this.selectedTime = timeSlot;
  }

  // ==============================================
  // METODE UTILITARE
  // ==============================================

  getDateErrorMessage(): string {
    const dateControl = this.appointmentFormGroup?.get('appointmentDate');

    if (dateControl?.hasError('required')) {
      return this.translate.instant('VALIDATION.APPOINTMENT_DATE_REQUIRED') || 'Data programării este obligatorie';
    }

    if (dateControl?.hasError('pastDate')) {
      return this.translate.instant('VALIDATION.APPOINTMENT_FUTURE_DATE') || 'Data programării trebuie să fie în viitor';
    }

    return '';
  }

  getUpdateDateErrorMessage(): string {
    const dateControl = this.updateAppointmentFormGroup?.get('appointmentDate');

    if (dateControl?.hasError('required')) {
      return this.translate.instant('VALIDATION.APPOINTMENT_DATE_REQUIRED') || 'Data programării este obligatorie';
    }

    if (dateControl?.hasError('pastDate')) {
      return this.translate.instant('VALIDATION.APPOINTMENT_FUTURE_DATE') || 'Data programării trebuie să fie în viitor';
    }

    return '';
  }

  handleDeleteAppointment(a: Appointment) {
    let conf = confirm(this.translate.instant('CONFIRMATION.DELETE_APPOINTMENT') || 'Sunteți sigur că doriți să anulați această programare?');
    if(!conf) return;

    const cancelledAppointment = {
      appointmentId: a.appointmentId,
      appointmentDate: a.appointmentDate,
      status: this.translate.instant('STATUS.CANCELED') || 'Anulată',
      reason: a.reason,
      doctor: { doctorId: a.doctor?.doctorId },
      patient: { patientId: this.currentPatient?.patientId }
    };

    this.appointmentService.updateAppointment(cancelledAppointment, cancelledAppointment.appointmentId).subscribe({
      next: () => {
        alert(this.translate.instant('SUCCESS.APPOINTMENT_CANCELLED') || 'Programarea a fost anulată cu succes');
        this.handleSearchPatientAppointments();
      },
      error: err => {
        alert(this.translate.instant('ERROR.CANCEL_APPOINTMENT') + ': ' + err.message);
        console.error(err);
      }
    });
  }

  getStatusClass(status: string): string {
    status = status?.toLowerCase() || '';

    if (status.includes('programat') || status.includes('scheduled') || status.includes('confirmată') || status.includes('confirmed')) {
      return 'status-confirmed';
    } else if (status.includes('finalizat') || status.includes('completed')) {
      return 'status-completed';
    } else if (status.includes('anulat') || status.includes('anulată') || status.includes('cancelled') || status.includes('canceled')) {
      return 'status-cancelled';
    } else if (status.includes('în așteptare') || status.includes('pending')) {
      return 'status-pending';
    }

    return '';
  }

  calculateDashboardSummary(appointments: Appointment[]): void {
    if (!appointments) return;

    const now = new Date();

    this.totalAppointments = appointments.length;
    this.upcomingAppointments = 0;
    this.completedAppointments = 0;
    this.canceledAppointments = 0;

    appointments.forEach(appointment => {
      const status = appointment.status ? appointment.status.toLowerCase() : '';
      const appointmentDate = new Date(appointment.appointmentDate);

      if (status.includes('finalizat') || status.includes('completed')) {
        this.completedAppointments++;
      }
      else if (status.includes('anulat') || status.includes('cancelled') || status.includes('canceled')) {
        this.canceledAppointments++;
      }
      else if (appointmentDate > now) {
        this.upcomingAppointments++;
      }
    });
  }

  getFormattedStatus(status: string): string {
    if (!status) return '';

    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus.includes('complet') || normalizedStatus === 'completed') {
      return 'STATUS.COMPLETED';
    }
    if (normalizedStatus.includes('confirm') || normalizedStatus === 'confirmed') {
      return 'STATUS.CONFIRMED';
    }
    if (normalizedStatus.includes('cancel') || normalizedStatus === 'cancelled') {
      return 'STATUS.CANCELED';
    }
    if (normalizedStatus.includes('schedul') || normalizedStatus === 'scheduled' ||
      normalizedStatus.includes('appointment') || normalizedStatus.includes('programat')) {
      return 'STATUS.SCHEDULED';
    }
    if (normalizedStatus.includes('finalizat')) {
      return 'STATUS.COMPLETED';
    }
    if (normalizedStatus.includes('anulat')) {
      return 'STATUS.CANCELED';
    }

    return status;
  }
  appointmentTypes: { [key: string]: string[] } = {
    'Cardiologie': [
      'APPOINTMENT_TYPES.CARDIOLOGY.INITIAL_CONSULT',
      'APPOINTMENT_TYPES.CARDIOLOGY.PERIODIC_CONTROL',
      'APPOINTMENT_TYPES.CARDIOLOGY.EKG',
      'APPOINTMENT_TYPES.CARDIOLOGY.ECHOCARDIOGRAPHY',
      'APPOINTMENT_TYPES.CARDIOLOGY.HOLTER',
      'APPOINTMENT_TYPES.CARDIOLOGY.STRESS_TEST',
      'APPOINTMENT_TYPES.CARDIOLOGY.HYPERTENSION_MONITORING'
    ],
    'Pediatrie': [
      'APPOINTMENT_TYPES.PEDIATRICS.INITIAL_CONSULT',
      'APPOINTMENT_TYPES.PEDIATRICS.GROWTH_CONTROL',
      'APPOINTMENT_TYPES.PEDIATRICS.VACCINATIONS',
      'APPOINTMENT_TYPES.PEDIATRICS.SCHOOL_EXAM',
      'APPOINTMENT_TYPES.PEDIATRICS.INFECTIOUS_DISEASES',
      'APPOINTMENT_TYPES.PEDIATRICS.POST_ILLNESS_CONTROL'
    ],
    'Radiologie': [
      'APPOINTMENT_TYPES.RADIOLOGY.CT_SCAN'
    ],
    'Dermatologie': [
      'APPOINTMENT_TYPES.DERMATOLOGY.INITIAL_CONSULT',
      'APPOINTMENT_TYPES.DERMATOLOGY.LESION_CONTROL',
      'APPOINTMENT_TYPES.DERMATOLOGY.DERMATOSCOPY',
      'APPOINTMENT_TYPES.DERMATOLOGY.SKIN_BIOPSY',
      'APPOINTMENT_TYPES.DERMATOLOGY.ACNE_TREATMENT',
      'APPOINTMENT_TYPES.DERMATOLOGY.ALLERGY_CONTROL'
    ],
    'Neurologie': [
      'APPOINTMENT_TYPES.NEUROLOGY.INITIAL_CONSULT',
      'APPOINTMENT_TYPES.NEUROLOGY.EEG',
      'APPOINTMENT_TYPES.NEUROLOGY.EPILEPSY_CONTROL',
      'APPOINTMENT_TYPES.NEUROLOGY.MIGRAINE_CONTROL',
      'APPOINTMENT_TYPES.NEUROLOGY.POST_STROKE_EXAM',
      'APPOINTMENT_TYPES.NEUROLOGY.PARKINSON_CONTROL'
    ],
    'Oftalmologie': [
      'APPOINTMENT_TYPES.OPHTHALMOLOGY.INITIAL_CONSULT',
      'APPOINTMENT_TYPES.OPHTHALMOLOGY.VISION_CONTROL',
      'APPOINTMENT_TYPES.OPHTHALMOLOGY.FUNDUS_EXAM',
      'APPOINTMENT_TYPES.OPHTHALMOLOGY.INTRAOCULAR_PRESSURE',
      'APPOINTMENT_TYPES.OPHTHALMOLOGY.CATARACT_CONTROL',
      'APPOINTMENT_TYPES.OPHTHALMOLOGY.GLAUCOMA_CONTROL'
    ],
    'Ginecologie': [
      'APPOINTMENT_TYPES.GYNECOLOGY.INITIAL_CONSULT',
      'APPOINTMENT_TYPES.GYNECOLOGY.PREVENTIVE_CONTROL',
      'APPOINTMENT_TYPES.GYNECOLOGY.FAMILY_PLANNING',
      'APPOINTMENT_TYPES.GYNECOLOGY.PREGNANCY_CONTROL',
      'APPOINTMENT_TYPES.GYNECOLOGY.PAP_SMEAR',
      'APPOINTMENT_TYPES.GYNECOLOGY.GYNECOLOGICAL_ULTRASOUND'
    ],
    'Oncologie': [
      'APPOINTMENT_TYPES.ONCOLOGY.INITIAL_CONSULT',
      'APPOINTMENT_TYPES.ONCOLOGY.POST_TREATMENT_CONTROL',
      'APPOINTMENT_TYPES.ONCOLOGY.TREATMENT_RESPONSE_EVALUATION',
      'APPOINTMENT_TYPES.ONCOLOGY.CHEMOTHERAPY_CONSULT',
      'APPOINTMENT_TYPES.ONCOLOGY.ONCOLOGICAL_FOLLOW_UP',
      'APPOINTMENT_TYPES.ONCOLOGY.RADIOTHERAPY_CONSULT'
    ],
    'Endocrinologie': [
      'APPOINTMENT_TYPES.ENDOCRINOLOGY.INITIAL_CONSULT',
      'APPOINTMENT_TYPES.ENDOCRINOLOGY.DIABETES_CONTROL',
      'APPOINTMENT_TYPES.ENDOCRINOLOGY.THYROID_CONTROL',
      'APPOINTMENT_TYPES.ENDOCRINOLOGY.HORMONAL_EVALUATION',
      'APPOINTMENT_TYPES.ENDOCRINOLOGY.OSTEOPOROSIS_CONTROL',
      'APPOINTMENT_TYPES.ENDOCRINOLOGY.METABOLISM_CONSULT'
    ],
    'Ortopedie': [
      'APPOINTMENT_TYPES.ORTHOPEDICS.INITIAL_CONSULT',
      'APPOINTMENT_TYPES.ORTHOPEDICS.FRACTURE_CONTROL',
      'APPOINTMENT_TYPES.ORTHOPEDICS.JOINT_PAIN_EVALUATION',
      'APPOINTMENT_TYPES.ORTHOPEDICS.POST_OPERATIVE_CONTROL',
      'APPOINTMENT_TYPES.ORTHOPEDICS.JOINT_INFILTRATIONS',
      'APPOINTMENT_TYPES.ORTHOPEDICS.PHYSIOTHERAPY'
    ],
    'Reumatologie': [
      'APPOINTMENT_TYPES.RHEUMATOLOGY.INITIAL_CONSULT',
      'APPOINTMENT_TYPES.RHEUMATOLOGY.RHEUMATOID_ARTHRITIS_CONTROL',
      'APPOINTMENT_TYPES.RHEUMATOLOGY.SPONDYLOARTHRITIS_CONTROL',
      'APPOINTMENT_TYPES.RHEUMATOLOGY.JOINT_PAIN_EVALUATION',
      'APPOINTMENT_TYPES.RHEUMATOLOGY.LUPUS_CONTROL',
      'APPOINTMENT_TYPES.RHEUMATOLOGY.JOINT_INFILTRATIONS'
    ]
  };


  getAppointmentTypesBySpecialization(specializationName: string): void {
    this.filteredAppointmentTypes = this.appointmentTypes[specializationName] || [];
  }
  getTranslatedReason(reason: string): string {
    if (!reason || reason === '-') {
      return '-';
    }

    // Verifică dacă reason-ul este o cheie de traducere
    if (reason.startsWith('APPOINTMENT_TYPES.')) {
      return this.translate.instant(reason);
    }

    // Dacă nu este cheie de traducere, returnează textul original
    return reason;
  }


}
