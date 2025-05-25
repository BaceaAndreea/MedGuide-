// radiography.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RadiographyService {
  private apiUrl = 'http://localhost:8082/radiography';

  constructor(private http: HttpClient) { }

  analyzeRadiography(appointmentId: number, radiographyImage: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', radiographyImage);

    return this.http.post(
      `${this.apiUrl}/analyze/${appointmentId}`,
      formData,
      { responseType: 'text' }       // ← aici
    );
  }
}
