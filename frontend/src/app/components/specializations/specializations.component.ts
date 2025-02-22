import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private specializationsService: SpecializationsService
  ) {}

  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword: this.fb.control('')
    });
    this.handleSearchSpecializations();
  }

  showModal: boolean = false;

  // Deschide modalul
  openModal(content: any) {
    this.modalService.open(content, { size: 'xl' });
  }

  // Închide modalul
  closeModal(): void {
    this.showModal = false;
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
}
