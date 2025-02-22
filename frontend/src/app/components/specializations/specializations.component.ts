import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { SpecializationsService } from '../../services/specializations.service';
import { catchError, Observable, throwError } from 'rxjs';
import { PageRespone } from '../../model/page.response.model';
import { Specialization } from '../../model/specialization.model';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-specializations',
  standalone: true,
  templateUrl: './specializations.component.html',
  imports: [
    ReactiveFormsModule,
    NgIf,
    AsyncPipe,
    NgForOf,
    NgClass
  ],
  styleUrl: './specializations.component.scss'
})
export class SpecializationsComponent implements OnInit {
  searchFormGroup!: FormGroup;
  currentPage: number = 0;
  pageSize: number = 10;
  errorMessage!: String;
  pageSpecializations!: Observable<PageRespone<Specialization>>;
  specializationFormGroup!: FormGroup;
  submitted : boolean = false;
  updateSpecializationFormGroup!:FormGroup;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private specializationsService: SpecializationsService
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
        this.errorMessage = err.message;
        return throwError(err);
      })
    );
  }

  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchSpecializations();
  }

  handleDeleteSpecialization(spec: Specialization) {
    let conf = confirm("Are you sure?");
    if(!conf) return;
    this.specializationsService.deleteSpecialization(spec.specializationId).subscribe({
      next:() => {
        this.handleSearchSpecializations();
      },
      error: err => {
        alert(err.message);
        console.log(err);
      }
    })
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
      next:() => {alert("Specialization saved successfully");
        this.handleSearchSpecializations(); // Reîncarcă lista doctorilor
        this.submitted = false; // Resetăm starea formularului
        this.specializationFormGroup.reset(); // Resetăm formularul
        modal.close(); // Închidem modalul
      },
      error: err => {
        alert("Error saving doctor: " + err.message);
        console.error("Save error:", err);
      }
    })

  }

  getUpdateSpecializationModal(spec: Specialization, updateContent: any) {
    this.updateSpecializationFormGroup = this.fb.group({
      specializationId : [spec.specializationId, Validators.required],
      description: [spec.description]
    });
    this.modalService.open(updateContent, {size : 'xl'});
  }

  onUpdateSpecialization(updateModal: any) {
    this.submitted=true;
    if ( this.updateSpecializationFormGroup.invalid) return;

    const specialization = {
      specializationId: this.updateSpecializationFormGroup.value.specializationId,
      description: this.updateSpecializationFormGroup.value.description
    };

    this.specializationsService.updateSpecialization(specialization, specialization.specializationId).subscribe({
      next: () => {
        alert("Success updating Specialization");
        this.handleSearchSpecializations(); // Reîncarcă lista doctorilor
        this.submitted = false;
        updateModal.close(); // Închide modalul
      },
      error: err => {
        alert("Error updating doctor: " + err.message);
      }
    })

  }
}
