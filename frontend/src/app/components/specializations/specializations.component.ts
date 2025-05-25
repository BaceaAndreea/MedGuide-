// specializations.component.ts - Versiunea cu Status Toggle
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { SpecializationsService } from '../../services/specializations.service';
import { DoctorsService } from '../../services/doctors.service';
import { catchError, Observable, throwError, forkJoin } from 'rxjs';
import { PageRespone } from '../../model/page.response.model';
import { Specialization } from '../../model/specialization.model';
import { Doctor } from '../../model/doctor.model';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

// Interfață pentru specializare cu numărul de doctori și status
interface SpecializationWithExtras extends Specialization {
  doctorCount?: number;
  isLoadingDoctorCount?: boolean;
  status?: 'active' | 'inactive'; // Adăugăm status
  isTogglingStatus?: boolean; // Pentru loading state la toggle
}

@Component({
  selector: 'app-specializations',
  standalone: true,
  templateUrl: './specializations.component.html',
  imports: [
    ReactiveFormsModule,
    NgIf,
    AsyncPipe,
    NgForOf,
    NgClass,
    TranslateModule
  ],
  styleUrl: './specializations.component.scss'
})

export class SpecializationsComponent implements OnInit {
  searchFormGroup!: FormGroup;
  currentPage: number = 0;
  pageSize: number = 6;
  errorMessage!: String;
  pageSpecializations!: Observable<PageRespone<SpecializationWithExtras>>;
  specializationFormGroup!: FormGroup;
  submitted : boolean = false;
  updateSpecializationFormGroup!:FormGroup;

  // Map pentru a stoca numărul de doctori pentru fiecare specializare
  doctorCountMap: Map<number, number> = new Map();
  loadingDoctorCounts: Set<number> = new Set();

  // Map pentru a stoca status-ul specializărilor (simulat - în realitate vine din backend)
  statusMap: Map<number, 'active' | 'inactive'> = new Map();
  togglingStatus: Set<number> = new Set();

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private specializationsService: SpecializationsService,
    private doctorsService: DoctorsService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword: this.fb.control('')
    });
    this.specializationFormGroup = this.fb.group({
      description:["", Validators.required],
    })

    // Inițializăm status-urile (în realitate ar trebui să vină din backend)
    this.initializeStatuses();
    this.handleSearchSpecializations();
  }

  // Inițializează status-urile pentru toate specializările (simulat)
  initializeStatuses() {
    // În realitate, aceste statusuri ar trebui să vină din backend
    // Pentru demonstrație, setăm toate ca active
    for (let i = 1; i <= 20; i++) {
      this.statusMap.set(i, Math.random() > 0.3 ? 'active' : 'inactive');
    }
  }

  openModal(content: any) {
    this.submitted = false;
    this.specializationFormGroup.reset();
    this.modalService.open(content, { size: 'xl' });
  }

  onCloseModal(modal: any) {
    modal.close();
    this.specializationFormGroup.reset();
  }

  handleSearchSpecializations() {
    let keyword = this.searchFormGroup.value.keyword;
    this.pageSpecializations = this.specializationsService.searchSpecializations(keyword, this.currentPage, this.pageSize).pipe(
      catchError(err => {
        this.translate.get('ERROR.FETCH_SPECIALIZATIONS').subscribe((errorMessage: string) => {
          this.errorMessage = errorMessage;
        });
        return throwError(() => err);
      })
    );

    // După ce am obținut specializările, calculăm numărul de doctori pentru fiecare
    this.pageSpecializations.subscribe((result: PageRespone<SpecializationWithExtras>) => {
      if (result && result.content) {
        this.loadDoctorCountsForSpecializations(result.content);
      }
    });
  }

  // Metodă pentru a încărca numărul de doctori pentru fiecare specializare
  loadDoctorCountsForSpecializations(specializations: SpecializationWithExtras[]) {
    specializations.forEach(spec => {
      if (spec.specializationId && !this.doctorCountMap.has(spec.specializationId)) {
        this.loadingDoctorCounts.add(spec.specializationId);

        this.doctorsService.findDoctorsBySpecialization(spec.specializationId).subscribe({
          next: (doctors: Doctor[]) => {
            this.doctorCountMap.set(spec.specializationId!, doctors.length);
            this.loadingDoctorCounts.delete(spec.specializationId!);
          },
          error: (err) => {
            console.error(`Error loading doctors for specialization ${spec.specializationId}:`, err);
            this.doctorCountMap.set(spec.specializationId!, 0);
            this.loadingDoctorCounts.delete(spec.specializationId!);
          }
        });
      }
    });
  }

  // Metodă pentru a obține numărul de doctori dintr-o specializare
  getDoctorCount(specializationId: number): number {
    return this.doctorCountMap.get(specializationId) || 0;
  }

  // Metodă pentru a verifica dacă se încarcă numărul de doctori
  isLoadingDoctorCount(specializationId: number): boolean {
    return this.loadingDoctorCounts.has(specializationId);
  }

  // METODE PENTRU STATUS TOGGLE

  // Obține status-ul unei specializări
  getStatus(specializationId: number): 'active' | 'inactive' {
    return this.statusMap.get(specializationId) || 'active';
  }

  // Verifică dacă se face toggle la status
  isTogglingStatus(specializationId: number): boolean {
    return this.togglingStatus.has(specializationId);
  }

  // Toggle status pentru o specializare
  toggleStatus(spec: SpecializationWithExtras) {
    if (!spec.specializationId || this.isTogglingStatus(spec.specializationId)) {
      return; // Previne multiple click-uri
    }

    const currentStatus = this.getStatus(spec.specializationId);
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    // Setează loading state
    this.togglingStatus.add(spec.specializationId);

    // Simulăm un call la backend (în realitate ar trebui să faci un HTTP request)
    setTimeout(() => {
      // Actualizează status-ul
      this.statusMap.set(spec.specializationId!, newStatus);

      // Elimină loading state
      this.togglingStatus.delete(spec.specializationId!);

      // Afișează mesaj de succes
      const statusText = newStatus === 'active' ? 'activată' : 'dezactivată';
      this.translate.get('SUCCESS.SPECIALIZATION_STATUS_UPDATED').subscribe((message: string) => {
        alert(`Specializarea a fost ${statusText} cu succes!`);
      });

    }, 1000); // Simulăm delay de 1 secundă pentru request

    /*
    // În realitate, ar trebui să faci ceva de genul:
    this.specializationsService.updateSpecializationStatus(spec.specializationId, newStatus).subscribe({
      next: () => {
        this.statusMap.set(spec.specializationId!, newStatus);
        this.togglingStatus.delete(spec.specializationId!);
        // Show success message
      },
      error: (err) => {
        this.togglingStatus.delete(spec.specializationId!);
        // Show error message
      }
    });
    */
  }

  gotoPage(page: number) {
    if (page < 0 || page >= this.pageSize) return;
    this.currentPage = page;
    this.handleSearchSpecializations();
  }

  handleDeleteSpecialization(spec: Specialization) {
    this.translate.get('CONFIRMATION.DELETE_SPECIALIZATION').subscribe((confirmMessage: string) => {
      let conf = confirm(confirmMessage);
      if(!conf) return;

      this.specializationsService.deleteSpecialization(spec.specializationId).subscribe({
        next:() => {
          this.translate.get('SUCCESS.SPECIALIZATION_DELETED').subscribe((successMessage: string) => {
            alert(successMessage);
          });
          // Eliminăm din cache numărul de doctori și status-ul pentru specializarea ștearsă
          if (spec.specializationId) {
            this.doctorCountMap.delete(spec.specializationId);
            this.statusMap.delete(spec.specializationId);
          }
          this.handleSearchSpecializations();
        },
        error: err => {
          this.translate.get('ERROR.DELETE_SPECIALIZATION').subscribe((errorMessage: string) => {
            alert(errorMessage + ": " + err.message);
          });
          console.log(err);
        }
      });
    });
  }

  onSaveSpecialization(modal: any) {
    this.submitted = true;

    if(this.specializationFormGroup.invalid){
      console.log("Form is invalid", this.specializationFormGroup.errors);
      return;
    }

    const specialization = {
      description: this.specializationFormGroup.value.description
    };

    this.specializationsService.createSpecialization(specialization).subscribe({
      next:(response: any) => {
        this.translate.get('SUCCESS.SPECIALIZATION_CREATED').subscribe((successMessage: string) => {
          alert(successMessage);
        });

        // Setăm status-ul noii specializări ca activ
        if (response && response.specializationId) {
          this.statusMap.set(response.specializationId, 'active');
        }

        this.handleSearchSpecializations();
        this.submitted = false;
        this.specializationFormGroup.reset();
        modal.close();
      },
      error: err => {
        this.translate.get('ERROR.SAVE_SPECIALIZATION').subscribe((errorMessage: string) => {
          alert(errorMessage + ": " + err.message);
        });
        console.error("Save error:", err);
      }
    });
  }

  getUpdateSpecializationModal(spec: Specialization, updateContent: any) {
    this.submitted = false;
    this.updateSpecializationFormGroup = this.fb.group({
      specializationId : [spec.specializationId, Validators.required],
      description: [spec.description, Validators.required]
    });
    this.modalService.open(updateContent, {size : 'xl'});
  }

  onUpdateSpecialization(updateModal: any) {
    this.submitted = true;
    if (this.updateSpecializationFormGroup.invalid) return;

    const specialization = {
      specializationId: this.updateSpecializationFormGroup.value.specializationId,
      description: this.updateSpecializationFormGroup.value.description
    };

    this.specializationsService.updateSpecialization(specialization, specialization.specializationId).subscribe({
      next: () => {
        this.translate.get('SUCCESS.SPECIALIZATION_UPDATED').subscribe((successMessage: string) => {
          alert(successMessage);
        });
        this.handleSearchSpecializations();
        this.submitted = false;
        updateModal.close();
      },
      error: err => {
        this.translate.get('ERROR.UPDATE_SPECIALIZATION').subscribe((errorMessage: string) => {
          alert(errorMessage + ": " + err.message);
        });
      }
    });
  }
}
