import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Consultation} from '../model/consultation.model';
import {Observable} from 'rxjs';
import {PageRespone} from '../model/page.response.model';

@Injectable({
  providedIn: 'root'
})
export class ConsultationsService {

  constructor(private http : HttpClient) { }

  getAllConsultations(): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(`${environment.backendHost}/consultations/all`);
  }

  getConsultationsByPatient(patientId: number, page: number, size: number): Observable<PageRespone<Consultation>> {
    return this.http.get<PageRespone<Consultation>>(
      `${environment.backendHost}/patients/${patientId}/consultations?page=${page}&size=${size}`
    );
  }


  getConsultationsByDoctor(doctorId: number, page: number, size: number): Observable<PageRespone<Consultation>> {
    return this.http.get<PageRespone<Consultation>>(
      `${environment.backendHost}/doctors/${doctorId}/consultations?page=${page}&size=${size}`
    );
  }


  createConsultation(consultation: Consultation): Observable<Consultation> {
    return this.http.post<Consultation>(`${environment.backendHost}/consultations`, consultation);
  }


  updateConsultation(consultationId: number, consultation: Consultation): Observable<Consultation> {
    return this.http.put<Consultation>(`${environment.backendHost}/consultations/${consultationId}`, consultation);
  }


  deleteConsultation(consultationId: number): Observable<void> {
    return this.http.delete<void>(`${environment.backendHost}/consultations/${consultationId}`);
  }
}
