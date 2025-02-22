import {Component, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {HospitalsService} from '../../services/hospitals.service';
import {catchError, Observable, throwError} from 'rxjs';
import {PageRespone} from '../../model/page.response.model';
import {Hospital} from '../../model/hospital.model';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';

@Component({
  selector: 'app-hospitals',
  standalone: true,
  templateUrl: './hospitals.component.html',
  imports: [
    ReactiveFormsModule,
    NgIf,
    AsyncPipe,
    NgForOf,
    NgClass
  ],
  styleUrl: './hospitals.component.scss'
})
export class HospitalsComponent  implements OnInit{
  searchFormGroup!: FormGroup;
  currentPage : number = 0;
  pageSize : number = 10;
  errorMessage!: String;
  pageHospitals!: Observable<PageRespone<Hospital>>;
  hospitalFormGroup!: FormGroup;
  submitted : boolean = false;
  updateHospitalFormGroup!:FormGroup;


  constructor(private modalService : NgbModal, private fb : FormBuilder, private hospitalsService : HospitalsService) { }

  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword : this.fb.control('')
    })

    this.hospitalFormGroup = this.fb.group({
      name:["", Validators.required],
      address:["", Validators.required],
      city:["", Validators.required]
    })

    this.handleSearchHospitals();
  }


  // Deschide modalul
  openModal(content:any){
    this.submitted = false;
    this.modalService.open(content, {size : 'xl'})
  }
  onCloseModal(modal: any) {
    modal.close();
    this.hospitalFormGroup.reset();
  }



  handleSearchHospitals() {
    let keyword = this.searchFormGroup.value.keyword;
    this.pageHospitals = this.hospitalsService.searchHospitals( keyword, this.currentPage, this.pageSize).pipe(
      catchError(err => {
        this.errorMessage = err.message;
        return throwError(err)
      })
    )

  }

  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchHospitals();
  }

  onSaveHospital(modal : any){
    this.submitted = true;

    if(this.hospitalFormGroup.invalid){
      console.log("Form is invalid", this.hospitalFormGroup.errors);
      return;
    }

    const hospital = {
      name: this.hospitalFormGroup.value.name,
      address: this.hospitalFormGroup.value.address,
      city : this.hospitalFormGroup.value.city
    };

    console.log("Submiting hospital:", hospital);
    this.hospitalsService.createHospital(hospital).subscribe({
      next: () => {
        alert("Hospital saved successfully");
        this.handleSearchHospitals(); // Reîncarcă lista doctorilor
        this.submitted = false; // Resetăm starea formularului
        this.hospitalFormGroup.reset(); // Resetăm formularul
        modal.close(); // Închidem modalul
      },
      error: err => {
        alert("Error saving doctor: " + err.message);
        console.error("Save error:", err);
      }
    })
  }

  handleDeleteHospital(h: Hospital) {
    let conf = confirm("Are you sure?");
    if(!conf) return;
    this.hospitalsService.deleteHospital(h.hospitalId).subscribe({
      next:() => {
        this.handleSearchHospitals();
      },
      error: err => {
        alert(err.message);
        console.log(err);
      }
    })

  }

  getUpdateHospitalModal(h: Hospital, updateContent: any) {

    this.updateHospitalFormGroup = this.fb.group({
      hospitalId: [h.hospitalId, Validators.required],
      name: [h.name, Validators.required],
      address: [h.address, Validators.required],
      city: [h.city, Validators.required]
    });
    this.modalService.open(updateContent, {size : 'xl'});
  }

  onUpdateHospital(updateModal: any) {
    this.submitted=true;
    if ( this.updateHospitalFormGroup.invalid) return;


    const hospital = {
      hospitalId: this.updateHospitalFormGroup.value.hospitalId,
      name: this.updateHospitalFormGroup.value.name,
      address: this.updateHospitalFormGroup.value.address,
      city: this.updateHospitalFormGroup.value.city
    };


    this.hospitalsService.updateHospital(hospital, hospital.hospitalId).subscribe({
      next: () => {
        alert("Success updating Hospital");
        this.handleSearchHospitals(); // Reîncarcă lista doctorilor
        this.submitted = false;
        updateModal.close(); // Închide modalul
      },
      error: err => {
        alert("Error updating doctor: " + err.message);
      }
    })
  }
}
