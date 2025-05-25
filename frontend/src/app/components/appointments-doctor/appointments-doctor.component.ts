import {Component, inject} from '@angular/core';
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Patient} from '../../model/patient.model';
import {catchError, finalize, Observable, of, take, tap, throwError} from 'rxjs';
import {PageRespone} from '../../model/page.response.model';
import {Appointment} from '../../model/appointment.model';
import {Doctor} from '../../model/doctor.model';
import {ActivatedRoute} from '@angular/router';
import {AppointmentsService} from '../../services/appointments.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {PatientsService} from '../../services/patients.service';
import {Hospital} from '../../model/hospital.model';
import {Specialization} from '../../model/specialization.model';
import {ConsultationsService} from '../../services/consultations.service';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {RadiographyService} from '../../services/radiography.service';
import {DoctorsService} from '../../services/doctors.service';

@Component({
  selector: 'app-appointments-doctor',
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
  templateUrl: './appointments-doctor.component.html',
  styleUrl: './appointments-doctor.component.scss'
})
export class AppointmentsDoctorComponent {
  doctorId!: number;
  currentDoctor!: Doctor;
  pageAppointments$!: Observable<PageRespone<Appointment>>;
  currentPage: number = 0;
  pageSize: number = 5;
  errorMessage !: string;
  appointmentFormGroup!: FormGroup;
  submitted: boolean = false;
  patients$!: Observable<Array<Patient>>;
  errorMessagePatient!: string;
  updateAppointmentFormGroup!: FormGroup;
  defaultPatient!: Patient;
  // Proprietăți pentru cardurile de statistici
  totalAppointments: number = 0;
  upcomingAppointments: number = 0;
  completedAppointments: number = 0;
  cancelledAppointments: number = 0; // Adăugăm proprietate pentru programări anulate

  // Proprietăți pentru formularul de consultație
  consultationFormGroup!: FormGroup;
  selectedAppointment: any = null;
  submittedConsult: boolean = false;

  // Indicator pentru procesarea consultației
  processingConsultation: boolean = false;
  consultationSaved: boolean = false;
  showSuccessMessage: boolean = false;

  private appointmentService = inject(AppointmentsService);

  //propiertati pentru radiografie
  isRadiologist: boolean = false;
  radiographyFormGroup!: FormGroup;
  selectedFile: File | null = null;
  analyzeRadiographyInProgress: boolean = false;
  radiographyAnalysisResult: string | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;

  constructor(private route: ActivatedRoute, private fb: FormBuilder,
              private modalService: NgbModal, private patientService: PatientsService,
              private consultationsService: ConsultationsService,
              private translate: TranslateService,  private doctorsService: DoctorsService, private radiographyService: RadiographyService) {
  }


  fetchPatients() {
    this.patients$ = this.patientService.findAllPatients().pipe(
      catchError(err => {
        this.errorMessagePatient = this.translate.instant('ERROR.FETCH_PATIENTS');
        return throwError(err);
      })
    )
  }

  ngOnInit(): void {
    this.doctorId = this.route.snapshot.params['id'];
    this.fillCurrentDoctor();

    // Inițializăm formularul pentru radiografie
    this.radiographyFormGroup = this.fb.group({
      radiographyImage: ['', Validators.required]
    });

    // Verificăm dacă doctorul este radiolog
    this.checkIfRadiologist();
    this.consultationFormGroup = this.fb.group({
      diagnosis: ['', Validators.required],
      symptoms: [''],
      recommendations: [''],
      prescriptions: ['']
    });
    this.totalAppointments = 0;
    this.upcomingAppointments = 0;
    this.completedAppointments = 0;
    this.cancelledAppointments = 0; // Inițializăm și programările anulate
    this.loadAppointments();
  }


  // În appointments-doctor.component.ts

  private checkIfRadiologist(): void {
    console.log('Checking if doctor with ID:', this.doctorId, 'is a radiologist');

    // Folosim noul endpoint specific
    this.doctorsService.isRadiologistByDoctorId(this.doctorId).subscribe({
      next: (isRadiologist) => {
        console.log('Doctor is radiologist:', isRadiologist);
        this.isRadiologist = isRadiologist;
      },
      error: (error) => {
        console.error('Error checking if doctor is radiologist:', error);

        // În caz de eroare, încercăm metoda alternativă
        this.doctorsService.getDoctorDetails(this.doctorId).subscribe({
          next: (doctor) => {
            console.log('Doctor details received:', doctor);
            this.isRadiologist = this.doctorsService.isRadiologist(doctor);
            console.log('Is radiologist (from doctor details):', this.isRadiologist);
          },
          error: (detailsError) => {
            console.error('Error fetching doctor details:', detailsError);
            // Falback - setăm manual pentru testare
            this.isRadiologist = false;
          }
        });
      }
    });
  }

  private fillCurrentDoctor() {
    this.currentDoctor = {
      doctorId: this.doctorId,
      firstName: "",
      lastName: "",
      birthDate: new Date(),
      hospital: {} as Hospital,
      specialization: {} as Specialization,
      user: {email: "", password: ""}
    }
  }

  openRadiographyAnalysisModal(appointment: any, radiographyModal: any): void {
    this.selectedAppointment = appointment;
    this.radiographyFormGroup.reset();
    this.selectedFile = null;
    this.radiographyAnalysisResult = null;

    this.modalService.open(radiographyModal, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
  }
  // Adaugă această metodă pentru a previzualiza imaginea
  previewImage(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Creează un URL pentru fișierul selectat pentru a-l afișa
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviewUrl = e.target?.result || null;
      };
      reader.readAsDataURL(file);
    } else {
      this.imagePreviewUrl = null;
    }
  }

  isTumorDetected(): boolean {
    if (!this.radiographyAnalysisResult) return false;

    // Verifică dacă rezultatul conține cuvinte-cheie care indică tumoare
    const result = this.radiographyAnalysisResult.toLowerCase();

    // Verifică dacă există termeni specifici asociați cu tumorile
    return (
      (result.includes('glioma') && !result.includes('glioma: 0.00%')) ||
      (result.includes('meningioma') && !result.includes('meningioma: 0.00%')) ||
      (result.includes('pituitary') && !result.includes('pituitary: 0.00%'))
    );
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }
  analyzeRadiography(modal: any): void {
    if (!this.selectedFile || !this.selectedAppointment) {
      return;
    }

    this.analyzeRadiographyInProgress = true;
    this.radiographyAnalysisResult = null;  // Reset rezultatul anterior

    this.radiographyService.analyzeRadiography(
      this.selectedAppointment.appointmentId,
      this.selectedFile
    ).pipe(
      finalize(() => {
        this.analyzeRadiographyInProgress = false;
      })
    ).subscribe({
      next: (result) => {
        this.radiographyAnalysisResult = result;

        // Dacă dorim să completăm automat diagnosticul pe baza rezultatului
        if (this.consultationFormGroup) {
          const prefix = this.isTumorDetected() ?
            'ATENȚIE - Analiză AI mamografie (posibilă tumoare): ' :
            'Analiză AI mamografie: ';

          this.consultationFormGroup.patchValue({
            diagnosis: `${prefix}${result}`
          });
        }
      },
      error: (error) => {
        console.error('Error analyzing radiography:', error);
        this.radiographyAnalysisResult = this.translate.instant('ERROR.ANALYZE_RADIOGRAPHY');
      }
    });
  }

  // Metodă pentru transferul către formularul de consultație
  transferToConsultation(radiographyModal: any, consultationModal: any): void {
    radiographyModal.close();
    this.completeAppointment(this.selectedAppointment, consultationModal);

    // Precompletăm diagnosticul cu rezultatul analizei
    if (this.radiographyAnalysisResult && this.consultationFormGroup) {
      this.consultationFormGroup.patchValue({
        diagnosis: `Analiză AI mamografie: ${this.radiographyAnalysisResult}`
      });
    }
  }


  loadAppointments() {
    this.pageAppointments$ = this.appointmentService.getAppointmentByDoctor(
      this.doctorId, this.currentPage, this.pageSize
    ).pipe(
      tap(response => {
        console.log('Loaded appointments:', response);

        // Calculează statisticile
        this.totalAppointments = response.totalElements;

        // Normalizăm statusurile pentru a ne asigura că sunt contorizate corect
        this.upcomingAppointments = response.content.filter(a => {
          const status = a.status?.toUpperCase() || '';
          return status === 'SCHEDULED' ||
            status === 'CONFIRMED' ||
            status.includes('PROGRAMAT') ||
            status.includes('CONFIRM') ||
            status.includes('APPOINTMENT');
        }).length;

        this.completedAppointments = response.content.filter(a => {
          const status = a.status?.toUpperCase() || '';
          return status === 'COMPLETED' ||
            status.includes('FINALIZ') ||
            status.includes('COMPLET');
        }).length;

        // Adăugăm contorizarea programărilor anulate
        this.cancelledAppointments = response.content.filter(a => {
          const status = a.status?.toUpperCase() || '';
          return status === 'CANCELLED' ||
            status.includes('ANULAT') ||
            status.includes('CANCEL');
        }).length;

        console.log('Upcoming appointments:', this.upcomingAppointments);
        console.log('Completed appointments:', this.completedAppointments);
        console.log('Cancelled appointments:', this.cancelledAppointments);
      }),
      catchError(error => {
        console.error("Complete error fetching appointments:", error);
        this.errorMessage = this.translate.instant('ERROR.FETCH_DOCTOR_APPOINTMENTS');
        return throwError(error);
      })
    );
  }

  gotoPage(page: number) {
    this.currentPage = page;
    this.loadAppointments();
  }

  onCloseModal(modal: any) {
    modal.close();
    this.appointmentFormGroup.reset();
  }

  getUpdateModal(a: any, updateContent: any) {
    this.fetchPatients();
    this.selectedAppointment = a;

    this.updateAppointmentFormGroup = this.fb.group({
      appointmentId: [a.appointmentId, Validators.required],
      appointmentDate: [a.appointmentDate, Validators.required],
      appointmentStatus: [a.status, Validators.required],
      patient: [a.patient, Validators.required],
      reason: [a.reason || '', Validators.required] // Adăugăm câmpul pentru motiv cu validare required
    });

    this.defaultPatient = this.updateAppointmentFormGroup.controls['patient'].value;
    this.modalService.open(updateContent, {size: 'xl'});
  }

  onUpdateAppointment(updateModal: any) {
    this.submitted = true;
    if (this.updateAppointmentFormGroup.invalid) return;

    const appointment = {
      appointmentId: this.updateAppointmentFormGroup.value.appointmentId,
      appointmentDate: this.updateAppointmentFormGroup.value.appointmentDate,
      status: this.updateAppointmentFormGroup.value.appointmentStatus,
      reason: this.updateAppointmentFormGroup.value.reason, // Adăugăm motivul în obiectul trimis la API
      doctor: {doctorId: this.doctorId},
      patient: {patientId: this.updateAppointmentFormGroup.value.patient?.patientId}
    };

    // Preluăm statusul vechi pentru a actualiza corect contoarele
    const oldStatus = this.selectedAppointment?.status || '';
    const newStatus = appointment.status;

    // Actualizăm contoarele în funcție de modificările de status
    this.updateCountersBasedOnStatusChange(oldStatus, newStatus);

    updateModal.close();

    this.appointmentService.updateAppointment(appointment, appointment.appointmentId).subscribe({
      next: () => {
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);

        this.loadAppointments();
        this.submitted = false;
      },
      error: err => {
        // Dacă apare o eroare, restaurăm contoarele la valorile anterioare
        this.updateCountersBasedOnStatusChange(newStatus, oldStatus);

        alert(this.translate.instant('ERROR.UPDATE_APPOINTMENT'));
        this.loadAppointments();
      }
    });
  }

  // Metodă nouă pentru actualizarea contoarelor bazate pe schimbările de status
  private updateCountersBasedOnStatusChange(oldStatus: string, newStatus: string) {
    const oldStatusUpper = oldStatus.toUpperCase();
    const newStatusUpper = newStatus.toUpperCase();

    // Verificăm dacă statusul vechi era upcoming
    const wasUpcoming = oldStatusUpper === 'SCHEDULED' ||
      oldStatusUpper === 'CONFIRMED' ||
      oldStatusUpper.includes('PROGRAMAT') ||
      oldStatusUpper.includes('CONFIRM');

    // Verificăm dacă statusul vechi era completed
    const wasCompleted = oldStatusUpper === 'COMPLETED' ||
      oldStatusUpper.includes('FINALIZ') ||
      oldStatusUpper.includes('COMPLET');

    // Verificăm dacă statusul vechi era cancelled
    const wasCancelled = oldStatusUpper === 'CANCELLED' ||
      oldStatusUpper.includes('ANULAT') ||
      oldStatusUpper.includes('CANCEL');

    // Verificăm dacă noul status este upcoming
    const isUpcoming = newStatusUpper === 'SCHEDULED' ||
      newStatusUpper === 'CONFIRMED' ||
      newStatusUpper.includes('PROGRAMAT') ||
      newStatusUpper.includes('CONFIRM');

    // Verificăm dacă noul status este completed
    const isCompleted = newStatusUpper === 'COMPLETED' ||
      newStatusUpper.includes('FINALIZ') ||
      newStatusUpper.includes('COMPLET');

    // Verificăm dacă noul status este cancelled
    const isCancelled = newStatusUpper === 'CANCELLED' ||
      newStatusUpper.includes('ANULAT') ||
      newStatusUpper.includes('CANCEL');

    // Actualizăm contoarele
    if (wasUpcoming && !isUpcoming) {
      this.upcomingAppointments = Math.max(0, this.upcomingAppointments - 1);
    }

    if (wasCompleted && !isCompleted) {
      this.completedAppointments = Math.max(0, this.completedAppointments - 1);
    }

    if (wasCancelled && !isCancelled) {
      this.cancelledAppointments = Math.max(0, this.cancelledAppointments - 1);
    }

    if (!wasUpcoming && isUpcoming) {
      this.upcomingAppointments++;
    }

    if (!wasCompleted && isCompleted) {
      this.completedAppointments++;
    }

    if (!wasCancelled && isCancelled) {
      this.cancelledAppointments++;
    }
  }

  // Metoda de finalizare a programării
  completeAppointment(appointment: any, modal: any) {
    this.selectedAppointment = appointment;
    this.consultationSaved = false;
    this.processingConsultation = false;

    // Reset formular
    this.consultationFormGroup.reset();


    this.modalService.open(modal, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
  }

  saveConsultation(modal: any) {
    this.submittedConsult = true;

    if (this.consultationFormGroup.invalid) {
      return;
    }

    // Previne dubla procesare
    if (this.processingConsultation) {
      return;
    }

    this.processingConsultation = true;

    // Verifică dacă statusul nu este deja COMPLETED
    if (this.selectedAppointment.status !== 'COMPLETED' &&
      this.selectedAppointment.status !== 'Finalizată') {
      // Actualizăm statisticile imediat pentru experiență utilizator mai bună
      this.upcomingAppointments = Math.max(0, this.upcomingAppointments - 1);
      this.completedAppointments++;

      // Actualizăm statusul local pentru a actualiza interfața imediat
      this.selectedAppointment.status = 'COMPLETED';
    }

    // Închide modalul imediat
    modal.close();

    const consultationData = {
      appointmentId: this.selectedAppointment.appointmentId,
      diagnosis: this.consultationFormGroup.value.diagnosis,
      symptoms: this.consultationFormGroup.value.symptoms || '',
      recommendations: this.consultationFormGroup.value.recommendations || '',
      prescriptions: this.consultationFormGroup.value.prescriptions || ''
    };

    console.log('Sending consultation data:', consultationData);
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);

    this.consultationsService.createConsultation(consultationData)
      .pipe(
        tap(response => {
          console.log('Consultation created successfully:', response);
          this.consultationSaved = true;
        }),
        finalize(() => {
          // Încărcăm datele la final, dar ne asigurăm că processingConsultation este setat pe false
          setTimeout(() => {
            this.processingConsultation = false;
            this.loadAppointments(); // Reîncărcăm datele pentru a actualiza UI-ul
          }, 1000);
        })
      )
      .subscribe({
        next: () => {
          // Actualizăm statusul programării după ce consultația a fost creată cu succes
          this.updateAppointmentStatusSilently();
        },
        error: (err) => {
          console.error('Error creating consultation:', err);

          if (err.status === 409 ||
            (err.error && err.error.message && err.error.message.includes('Duplicate entry'))) {
            console.log('Consultation already exists, attempting to update status anyway');
            this.updateAppointmentStatusSilently();
          } else {
            // Revertim schimbările statisticilor dacă apare o eroare
            if (this.selectedAppointment.status === 'COMPLETED' ||
              this.selectedAppointment.status === 'Finalizată') {
              this.upcomingAppointments++;
              this.completedAppointments = Math.max(0, this.completedAppointments - 1);
              // Restaurăm statusul anterior
              this.selectedAppointment.status = 'CONFIRMED'; // sau statusul anterior
            }

            console.error('Eroare la crearea consultației:', err);
          }
        }
      });
  }

  private updateAppointmentStatusSilently() {
    const appointmentToUpdate = {
      appointmentId: this.selectedAppointment.appointmentId,
      status: "COMPLETED",
      appointmentDate: this.selectedAppointment.appointmentDate,
      doctor: {doctorId: this.doctorId},
      patient: {patientId: this.selectedAppointment.patient.patientId}
    };

    console.log('Silently updating appointment status:', appointmentToUpdate);
    this.appointmentService.updateAppointment(appointmentToUpdate, this.selectedAppointment.appointmentId)
      .pipe(
        tap(response => {
          console.log('Appointment status updated successfully:', response);
          this.selectedAppointment.status = 'COMPLETED';
          this.consultationSaved = true;
        }),
        catchError(error => {
          console.error('Error updating appointment status:', error);
          return of({});
        }),
        finalize(() => {
          this.loadAppointments();
        })
      )
      .subscribe();
  }

  handleNewPatientAppointment(appointmentData: any) {
    const newAppointment = {
      ...appointmentData,
      status: 'CONFIRMED',
      doctor: {doctorId: this.doctorId}
    };

    this.appointmentService.saveAppointment(newAppointment).subscribe({
      next: (savedAppointment) => {
        console.log('New appointment created with CONFIRMED status:', savedAppointment);
        this.totalAppointments++;
        this.upcomingAppointments++;


        if (this.pageAppointments$) {
          this.pageAppointments$.pipe(
            take(1)
          ).subscribe(currentPage => {
            const updatedContent = [...currentPage.content, savedAppointment];
            this.pageAppointments$ = of({
              ...currentPage,
              content: updatedContent,
              totalElements: currentPage.totalElements + 1
            });
          });
        }
        setTimeout(() => this.loadAppointments(), 100);
      },
      error: (err) => {
        console.error('Error creating new appointment:', err);
        alert(this.translate.instant('ERROR.SAVE_APPOINTMENT'));
      }
    });
  }

  getStatusText(status: string): string {
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

  isCompletedStatus(status: string | undefined): boolean {
    if (!status) return false;

    const normalizedStatus = status.toLowerCase();
    return normalizedStatus === 'completed' ||
      normalizedStatus === 'finalizată' ||
      normalizedStatus.includes('finaliz') ||
      normalizedStatus.includes('complet');
  }
}
