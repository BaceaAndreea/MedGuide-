import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Consultation} from '../model/consultation.model';
import {catchError, map, Observable, of, pipe, tap, throwError} from 'rxjs';
import {PageRespone} from '../model/page.response.model';
import {ConsultationsDoctorComponent} from '../components/consultations-doctor/consultations-doctor.component';

@Injectable({
  providedIn: 'root'
})
export class ConsultationsService {
  normalizeConsultationData(consultation: any): any {
    // Pentru debugging
    console.log('All properties in consultation object:', Object.keys(consultation));

    return {
      ...consultation,
      diagnosis: consultation.diagnosis || '',
      symptoms: consultation.symptoms || consultation.symptom ||
        consultation.symptomsText || consultation.symptomsList || '',
      recommendations: consultation.recommendations || consultation.recommendation ||
        consultation.recommendationsText || consultation.recommendationsList || '',
      prescriptions: consultation.prescriptions || consultation.prescription ||
        consultation.medicationsList || consultation.medications || '',
      patientFirstName: consultation.patientFirstName || '',
      patientLastName: consultation.patientLastName || '',
      appointmentDate: consultation.appointmentDate || new Date(),
      hospitalAddress: consultation.hospitalAddress || '',
      // Add rating fields
      rating: consultation.rating || null,
      reviewComment: consultation.reviewComment || '',
      reviewDate: consultation.reviewDate || null,
      isReviewed: consultation.rating != null || (consultation.reviewComment ?? '').trim().length > 0
    };
  }

  constructor(private http : HttpClient) { }

  getAllConsultations(): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(`${environment.backendHost}/consultations/all`);
  }

  // consultations.service.ts

  getConsultationsByPatient(patientId: number, page: number, size: number)
    : Observable<PageRespone<Consultation>> {
    return this.http
      .get<PageRespone<Consultation>>(
        `${environment.backendHost}/patients/${patientId}/consultations?page=${page}&size=${size}`
      )
      .pipe(
        // aici intră normalizeConsultationData pentru fiecare element
        map(pageResp => {
          const normalized = pageResp.content.map(item =>
            this.normalizeConsultationData(item)
          );
          return {
            ...pageResp,
            content: normalized
          };
        }),
        tap(resp => console.log('Normalized page:', resp))
      );
  }


  getConsultationsByDoctor(doctorId: number, page: number, size: number): Observable<PageRespone<Consultation>> {
    return this.http.get<PageRespone<Consultation>>(
      `${environment.backendHost}/doctors/${doctorId}/consultations?page=${page}&size=${size}`
    );
  }

  createConsultation(consultationData: any): Observable<any> {
    console.log('Creating consultation with data:', consultationData);

    // Asigură-te că toate câmpurile sunt trimise explicit, chiar dacă sunt null
    const consultation = {
      appointmentId: consultationData.appointmentId,
      diagnosis: consultationData.diagnosis || '',
      symptoms: consultationData.symptoms || '',
      recommendations: consultationData.recommendations || '',
      prescriptions: consultationData.prescriptions || ''
    };
    return this.http.post<any>(`${environment.backendHost}/consultations`, consultation);
  }

  deleteConsultation(consultationId: number): Observable<void> {
    return this.http.delete<void>(`${environment.backendHost}/consultations/${consultationId}`);
  }

  getConsultationByAppointmentId(appointmentId: number): Observable<Consultation> {
    return this.http.get<Consultation>(`${environment.backendHost}/consultations/appointment/${appointmentId}`)
      .pipe(
        map(response => {
          // Verifică dacă răspunsul este un obiect cu proprietatea content (array)
          if (response && (response as any).content && Array.isArray((response as any).content)) {
            return {
              ...response,
              content: (response as any).content.map((consultation: any) =>
                this.normalizeConsultationData(consultation)
              )
            };
          }
          // Dacă nu, este un singur obiect de consultație
          return this.normalizeConsultationData(response);
        }),
        catchError(error => {
          console.error('Error fetching consultation by appointment:', error);
          return throwError(() => error);
        })
      );
  }

  updateConsultation(consultationId: number, consultationData: any): Observable<any> {
    return this.http.put<any>(`${environment.backendHost}/consultations/${consultationId}`, consultationData);
  }

  getConsultationById(id: number): Observable<Consultation> {
    return this.http.get<Consultation>(`${environment.backendHost}/consultations/${id}`)
      .pipe(
        tap(consultation => console.log('Raw consultation details:', consultation)),
        map(consultation => this.normalizeConsultationData(consultation)),
        tap(normalizedConsultation => console.log('Normalized consultation details:', normalizedConsultation)),
        catchError((error) => {
          console.error('Error fetching consultation details:', error);
          return throwError(() => error);
        })
      );
  }

  // Add rating to a consultation
  addRating(consultationId: number, ratingData: any): Observable<Consultation> {
    return this.http.post<Consultation>(
      `${environment.backendHost}/consultations/${consultationId}/rating`,
      ratingData
    ).pipe(
      tap(response => console.log('Rating submission response:', response)),
      map(consultation => this.normalizeConsultationData(consultation)),
      catchError((error) => {
        console.error('Error submitting rating:', error);
        return throwError(() => error);
      })
    );
  }

  // Check if a consultation has a rating
  hasRating(consultationId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${environment.backendHost}/consultations/${consultationId}/has-rating`
    ).pipe(
      catchError((error) => {
        console.error('Error checking rating status:', error);
        return throwError(() => error);
      })
    );
  }
}
