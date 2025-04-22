import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { SpecializationsService } from '../../services/specializations.service';
import { catchError, Observable, throwError } from 'rxjs';
import { PageRespone } from '../../model/page.response.model';
import { Specialization } from '../../model/specialization.model';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

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
  pageSpecializations!: Observable<PageRespone<Specialization>>;
  specializationFormGroup!: FormGroup;
  submitted : boolean = false;
  updateSpecializationFormGroup!:FormGroup;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private specializationsService: SpecializationsService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword: this.fb.control('')
    });
    this.specializationFormGroup = this.fb.group({
      description:["", Validators.required],
    })

    this.handleSearchSpecializations();
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
  }

  gotoPage(page: number) {
    if (page < 0 || page >= this.pageSize) return;  // Validare pagina
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
      next:() => {
        this.translate.get('SUCCESS.SPECIALIZATION_CREATED').subscribe((successMessage: string) => {
          alert(successMessage);
        });
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
