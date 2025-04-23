import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Doctor} from '../../model/doctor.model';
import {Hospital} from '../../model/hospital.model';
import {Specialization} from '../../model/specialization.model';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {DoctorsService} from '../../services/doctors.service';
import {HospitalsService} from '../../services/hospitals.service';
import {CommonModule, isPlatformBrowser, NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Inject, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  // Date pentru translatare
  currentLang = 'ro';

  // Date pentru doctori
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  visibleDoctors: Doctor[] = [];
  doctorsStartIndex = 0;
  doctorsPerPage = 4;

  // Date pentru spitale
  hospitals: Hospital[] = [];
  visibleHospitals: Hospital[] = [];
  hospitalsStartIndex = 0;
  hospitalsPerPage = 4;

  // Date pentru specializări
  specializations: Specialization[] = [];
  selectedSpecialization = 0;

  // Stare de încărcare
  loadingDoctors = false;
  loadingHospitals = false;
  loadingSpecializations = false;

  // Stare de eroare
  errorFetchingDoctors = false;
  errorFetchingHospitals = false;
  errorFetchingSpecializations = false;

  // Stare de filtrare
  isFiltering = false;

  // Favorite spitale
  favoriteHospitals: number[] = [];

  constructor(
    private router: Router,
    private translate: TranslateService,
    private doctorsService: DoctorsService,
    private hospitalsService: HospitalsService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Inițializează serviciul de translatare
    this.translate.setDefaultLang('ro');
    this.translate.use('ro');

    // Încărcăm favoritele direct din localStorage (va funcționa doar în browser)
    this.loadFavoriteHospitals();
  }

  ngOnInit(): void {
    this.loadFeaturedDoctors();
    this.loadFeaturedHospitals();
    this.loadSpecializations();
  }

  // Metode pentru gestionarea localStorage (funcționalitate simplificată)
  private loadFavoriteHospitals(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedFavorites = localStorage.getItem('favoriteHospitals');
      if (savedFavorites) {
        try {
          this.favoriteHospitals = JSON.parse(savedFavorites);
        } catch (e) {
          console.error('Eroare la parsarea favoritelor:', e);
          this.favoriteHospitals = [];
        }
      }
    }
  }

  private saveFavoriteHospitals(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('favoriteHospitals', JSON.stringify(this.favoriteHospitals));
    }
  }

  // Metodă pentru traducerea specializărilor folosind fișierele de traducere
  getSpecializationTranslation(specialization: string): string {
    const key = this.getTranslationKey(specialization);
    if (key) {
      return this.translate.instant(`SPECIALIZATIONS.${key}`);
    }

    // Dacă nu găsim o traducere, returnăm valoarea originală
    return specialization;
  }

  // Metodă pentru a obține cheia de traducere
  private getTranslationKey(specialization: string): string | null {
    // Mapăm textul specializării la cheia din fișierele de traducere
    const specializationMap: { [key: string]: string } = {
      'Pediatrics': 'PEDIATRICS',
      'Dermatology': 'DERMATOLOGY',
      'Cardiology': 'CARDIOLOGY',
      'Neurology': 'NEUROLOGY',
      'Ophthalmology': 'OPHTHALMOLOGY',
      'Orthopedics': 'ORTHOPEDICS',
      'Psychiatry': 'PSYCHIATRY',
      'Gynecology': 'GYNECOLOGY',
      'Urology': 'UROLOGY',
      'Oncology': 'ONCOLOGY',
      'Endocrinology': 'ENDOCRINOLOGY',
      'Gastroenterology': 'GASTROENTEROLOGY',
      'Rheumatology': 'RHEUMATOLOGY',
      'General Practice': 'GENERAL_PRACTICE',
      'Internal Medicine': 'INTERNAL_MEDICINE',
      'Family Medicine': 'FAMILY_MEDICINE',
      'Hematology': 'HEMATOLOGY',
      'Allergy & Immunology': 'ALLERGY_IMMUNOLOGY',
      'Infectious Disease': 'INFECTIOUS_DISEASE',
      'Pulmonology': 'PULMONOLOGY',
      'Nephrology': 'NEPHROLOGY'
    };
    return specializationMap[specialization] || null;
  }


  // Metodă pentru navigarea la pagina de autentificare
  navigateToAuth(): void {
    this.router.navigate(['/auth']);
  }

  // Metodă pentru schimbarea limbii - va fi folosită prin app.component
  switchLanguage(lang: string): void {
    this.currentLang = lang;
    this.translate.use(lang);
  }

  loadFeaturedDoctors(): void {
    this.loadingDoctors = true;
    this.errorFetchingDoctors = false;

    // Direct API call without authentication headers
    this.http.get<Doctor[]>(`${environment.backendHost}/doctors/featured`).subscribe({
      next: (data) => {
        console.log('Doctori primiți:', data);
        this.doctors = data;

        this.doctors.forEach(doctor => {
          if (doctor.imageUrl) {
            if (!doctor.imageUrl.startsWith('http') && !doctor.imageUrl.startsWith('/assets')) {
              doctor.imageUrl = `${environment.backendHost}/${doctor.imageUrl}`;
            } else if (doctor.imageUrl.startsWith('/assets')) {
              doctor.imageUrl = doctor.imageUrl.replace('/assets', `${environment.backendHost}/assets`);
            }
          }
        });

        this.filteredDoctors = [...this.doctors];
        this.updateVisibleDoctors();
        this.loadingDoctors = false;
      },
      error: (error) => {
        console.error('Error fetching featured doctors:', error);
        this.loadingDoctors = false;
        this.errorFetchingDoctors = true;
      }
    });
  }

  loadFeaturedHospitals(): void {
    this.loadingHospitals = true;
    this.errorFetchingHospitals = false;

    // Direct API call without authentication headers
    this.http.get<Hospital[]>(`${environment.backendHost}/hospitals/featured`).subscribe({
      next: (data) => {
        console.log('Spitale primite:', data);
        this.hospitals = data;

        this.hospitals.forEach(hospital => {
          if (hospital.imageUrl) {
            if (!hospital.imageUrl.startsWith('http') && !hospital.imageUrl.startsWith('/assets')) {
              hospital.imageUrl = `${environment.backendHost}/${hospital.imageUrl}`;
            } else if (hospital.imageUrl.startsWith('/assets')) {
              hospital.imageUrl = hospital.imageUrl.replace('/assets', `${environment.backendHost}/assets`);
            }
          }
        });

        this.updateVisibleHospitals();
        this.loadingHospitals = false;
      },
      error: (error) => {
        console.error('Error fetching featured hospitals:', error);
        this.loadingHospitals = false;
        this.errorFetchingHospitals = true;
      }
    });
  }

  loadSpecializations(): void {
    this.loadingSpecializations = true;
    this.errorFetchingSpecializations = false;

    // Direct API call without authentication headers
    this.http.get<Specialization[]>(`${environment.backendHost}/specializations/all`).subscribe({
      next: (data) => {
        this.specializations = data;
        this.loadingSpecializations = false;
      },
      error: (err) => {
        console.error('Error fetching specializations:', err);
        this.loadingSpecializations = false;
        this.errorFetchingSpecializations = true;
      }
    });
  }

  // Metode pentru filtrarea doctorilor după specializare
  filterDoctorsBySpecialization(): void {
    const specializationId = Number(this.selectedSpecialization);

    if (specializationId === 0) {
      // Dacă nu este selectată nicio specializare, afișăm toți doctorii
      this.filteredDoctors = [...this.doctors];
      this.updateVisibleDoctors();
    } else {
      // Altfel filtrăm doctorii după specializare
      this.isFiltering = true;
      this.loadingDoctors = true;

      // Direct API call without authentication headers
      this.http.get<Doctor[]>(`${environment.backendHost}/doctors/specialization/${specializationId}`).subscribe({
        next: (data) => {
          this.filteredDoctors = data;

          // Process image URLs to ensure they're valid
          this.filteredDoctors.forEach(doctor => {
            if (doctor.imageUrl) {
              if (!doctor.imageUrl.startsWith('http') && !doctor.imageUrl.startsWith('/assets')) {
                doctor.imageUrl = `${environment.backendHost}/${doctor.imageUrl}`;
              } else if (doctor.imageUrl.startsWith('/assets')) {
                doctor.imageUrl = doctor.imageUrl.replace('/assets', `${environment.backendHost}/assets`);
              }
            }
          });

          this.doctorsStartIndex = 0; // Resetăm indexul de start
          this.updateVisibleDoctors();
          this.loadingDoctors = false;
          this.isFiltering = false;
        },
        error: (err) => {
          console.error('Error filtering doctors by specialization:', err);
          this.loadingDoctors = false;
          this.isFiltering = false;

          // On error, just show the original list filtered in memory
          this.filteredDoctors = this.doctors.filter(
            doctor => doctor.specialization && doctor.specialization.specializationId === specializationId
          );
          this.updateVisibleDoctors();
        }
      });
    }
  }

  // Metode pentru navigarea în carousel-ul de doctori
  updateVisibleDoctors(): void {
    const endIndex = Math.min(this.doctorsStartIndex + this.doctorsPerPage, this.filteredDoctors.length);
    this.visibleDoctors = this.filteredDoctors.slice(this.doctorsStartIndex, endIndex);
  }

  nextDoctors(): void {
    const maxStartIndex = this.filteredDoctors.length - this.doctorsPerPage;
    this.doctorsStartIndex = Math.min(this.doctorsStartIndex + this.doctorsPerPage, maxStartIndex);
    this.updateVisibleDoctors();
  }

  prevDoctors(): void {
    this.doctorsStartIndex = Math.max(this.doctorsStartIndex - this.doctorsPerPage, 0);
    this.updateVisibleDoctors();
  }

  updateVisibleHospitals(): void {
    const endIndex = Math.min(this.hospitalsStartIndex + this.hospitalsPerPage, this.hospitals.length);
    this.visibleHospitals = this.hospitals.slice(this.hospitalsStartIndex, endIndex);
    console.log(`Showing hospitals ${this.hospitalsStartIndex + 1} to ${endIndex} of ${this.hospitals.length}`);
  }

  // Corectează metoda nextHospitals() pentru a naviga corect
  nextHospitals(): void {
    if (this.hospitalsStartIndex + this.hospitalsPerPage < this.hospitals.length) {
      this.hospitalsStartIndex += this.hospitalsPerPage;
      this.updateVisibleHospitals();
      console.log(`Moving to next page, now at index ${this.hospitalsStartIndex}`);
    }
  }

  // Verifică și prevHospitals() pentru a te asigura că funcționează corect
  prevHospitals(): void {
    if (this.hospitalsStartIndex > 0) {
      this.hospitalsStartIndex = Math.max(0, this.hospitalsStartIndex - this.hospitalsPerPage);
      this.updateVisibleHospitals();
      console.log(`Moving to previous page, now at index ${this.hospitalsStartIndex}`);
    }
  }

  getCurrentDoctorPage(): number {
    return Math.floor(this.doctorsStartIndex / this.doctorsPerPage) + 1;
  }

  getTotalDoctorPages(): number {
    return Math.ceil(this.filteredDoctors.length / this.doctorsPerPage);
  }

  getCurrentHospitalPage(): number {
    return Math.floor(this.hospitalsStartIndex / this.hospitalsPerPage) + 1;
  }

  getTotalHospitalPages(): number {
    return Math.ceil(this.hospitals.length / this.hospitalsPerPage);
  }

  openHospitalInMaps(hospital: Hospital): void {
    if (isPlatformBrowser(this.platformId)) {
      let mapsUrl: string;

      if ((hospital as any).latitude && (hospital as any).longitude) {
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lng}`;
      } else {
        const query = encodeURIComponent(`${hospital.address}, ${hospital.city}`);
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
      }
      window.open(mapsUrl, '_blank');
    }
  }
}
