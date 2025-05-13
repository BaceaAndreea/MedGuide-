import {Component, OnInit, HostListener} from '@angular/core';
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
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {SafePipe} from '../../pipes/safe.pipe';

// Interfețe pentru programele educaționale
interface LanguageOption {
  code: string;
  name: string;
  pdfUrl: string;
}

interface EducationalProgram {
  id: number;
  title: string;
  description: string;
  modules: number;
  duration: string;
  category: string;
  categoryClass: string;
  isFree: boolean;
  price?: string;
  rating?: number;
  reviewCount?: number;
  languages: LanguageOption[];
}

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

  // Header și navigare
  showLanguageDropdown = false;
  currentLanguage = 'ro';
  doctorsSection = 'doctors-section';
  hospitalsSection = 'hospitals-section';
  specializationsSection = 'specializations-section';

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

  // Date pentru programe educaționale
  educationalPrograms: EducationalProgram[] = [];
  loadingPrograms = false;
  errorFetchingPrograms = false;
  selectedLanguage = 'ro'; // Limba implicită
  visiblePrograms: EducationalProgram[] = [];
  programsStartIndex = 0;
  programsPerPage = 2;

  // Pentru vizualizarea PDF-urilor
  showPdfViewer = false;
  currentProgram: EducationalProgram | null = null;
  pdfUrl: SafeResourceUrl | null = null;
  pdfCompleted = false;
  userRating = 0;
  userReview = '';
  // Adaugă la variabilele de secțiune
  educationalSection = 'educational-section';

  constructor(
    private router: Router,
    private translate: TranslateService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Inițializează serviciul de translatare
    this.currentLanguage = this.translate.currentLang || 'ro';

    // Încărcăm favoritele direct din localStorage (va funcționa doar în browser)
    this.loadFavoriteHospitals();
  }

  ngOnInit(): void {
    this.loadFeaturedDoctors();
    this.loadFeaturedHospitals();
    this.loadSpecializations();
    this.loadEducationalPrograms();

    this.translate.onLangChange.subscribe(event => {
      this.currentLanguage = event.lang;
    });

    // Adaugă ID-uri la secțiuni pentru navigare
    setTimeout(() => {
      this.addSectionIds();
    }, 100);
  }

  // Adaugă ID-uri la secțiuni pentru navigare
  private addSectionIds(): void {
    // Verificăm dacă suntem în browser
    if (isPlatformBrowser(this.platformId)) {
      try {
        const doctorsEl = document.querySelector('.doctors-section');
        const hospitalsEl = document.querySelector('.featured-section.educational-programs-section');
        const specializationsEl = document.querySelector('.hero-section-v3');
        const educationalEl = document.querySelector('.educational-programs-section:last-of-type');

        if (doctorsEl) doctorsEl.id = this.doctorsSection;
        if (hospitalsEl) hospitalsEl.id = this.hospitalsSection;
        if (specializationsEl) specializationsEl.id = this.specializationsSection;
        if (educationalEl) educationalEl.id = this.educationalSection;

        console.log('Section IDs added successfully');
      } catch (error) {
        console.error('Error adding section IDs:', error);
      }
    }
  }

  // Închide dropdown-ul de limbă când se face click în afara lui
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    const isLanguageButton = targetElement.closest('.language-button');

    if (!isLanguageButton) {
      this.showLanguageDropdown = false;
    }
  }

  // Toggle dropdown limbă
  toggleLanguageDropdown(): void {
    this.showLanguageDropdown = !this.showLanguageDropdown;
  }

  // Schimbă limba
  changeLanguage(lang: string): void {
    console.log('Changing language in HomeComponent to:', lang);
    this.currentLanguage = lang;
    this.selectedLanguage = lang;

    // Folosește doar serviciul de traducere
    this.translate.use(lang);

    // Salvează limba preferată în localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('preferredLanguage', lang);
    }

    this.showLanguageDropdown = false;
  }

  // Metodă pentru scrolling smooth la secțiuni
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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


  loadFeaturedDoctors(): void {
    this.loadingDoctors = true;
    this.errorFetchingDoctors = false;

    // Direct API call without authentication headers
    this.http.get<Doctor[]>(`${environment.backendHost}/doctors/featured`).subscribe({
      next: (data) => {
        console.log('Doctori primiți:', data);
        this.doctors = data;

        // Procesare URLs imagini
        this.doctors.forEach(doctor => {
          // Procesare imagini
          if (doctor.imageUrl) {
            if (!doctor.imageUrl.startsWith('http') && !doctor.imageUrl.startsWith('/assets')) {
              doctor.imageUrl = `${environment.backendHost}/${doctor.imageUrl}`;
            } else if (doctor.imageUrl.startsWith('/assets')) {
              doctor.imageUrl = doctor.imageUrl.replace('/assets', `${environment.backendHost}/assets`);
            }
          }

          // Obține ratingurile pentru fiecare doctor
          this.loadDoctorRatings(doctor);
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

  loadDoctorRatings(doctor: Doctor): void {
    this.http.get<any>(`${environment.backendHost}/doctors/${doctor.doctorId}/ratings/summary`).subscribe({
      next: (summary) => {
        if (summary) {
          doctor.rating = summary.averageRating;
          doctor.reviewCount = summary.totalReviews;
          console.log(`Doctor ${doctor.firstName} ${doctor.lastName}: Rating ${doctor.rating} din ${doctor.reviewCount} recenzii`);
        } else {
          doctor.rating = undefined;
          doctor.reviewCount = 0;
        }
      },
      error: (error) => {
        console.error(`Error fetching ratings for doctor ${doctor.doctorId}:`, error);
        doctor.rating = undefined;
        doctor.reviewCount = 0;
      }
    });
  }

  loadFeaturedHospitals(): void {
    this.loadingHospitals = true;
    this.errorFetchingHospitals = false;

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

  // Metode pentru carousel-ul de programe educaționale
  updateVisiblePrograms(): void {
    const endIndex = Math.min(this.programsStartIndex + this.programsPerPage, this.educationalPrograms.length);
    this.visiblePrograms = this.educationalPrograms.slice(this.programsStartIndex, endIndex);
  }

  nextPrograms(): void {
    if (this.programsStartIndex + this.programsPerPage < this.educationalPrograms.length) {
      this.programsStartIndex += this.programsPerPage;
      this.updateVisiblePrograms();
    }
  }

  prevPrograms(): void {
    if (this.programsStartIndex > 0) {
      this.programsStartIndex = Math.max(0, this.programsStartIndex - this.programsPerPage);
      this.updateVisiblePrograms();
    }
  }

  getCurrentProgramPage(): number {
    return Math.floor(this.programsStartIndex / this.programsPerPage) + 1;
  }

  getTotalProgramPages(): number {
    return Math.ceil(this.educationalPrograms.length / this.programsPerPage);
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

  loadEducationalPrograms(): void {
    this.loadingPrograms = true;
    this.errorFetchingPrograms = false;

    setTimeout(() => {
      this.educationalPrograms = [
        {
          id: 1,
          title: this.translate.instant('EDUCATIONAL_PROGRAMS.PROGRAMS.BREAST_CANCER.TITLE'),
          description: this.translate.instant('EDUCATIONAL_PROGRAMS.PROGRAMS.BREAST_CANCER.DESCRIPTION'),
          modules: 5,
          duration: '2',
          category: 'cancer-prevention',
          categoryClass: 'category-green',
          isFree: true,
          rating: 4.8,
          reviewCount: 143,
          languages: [
            {
              code: 'ro',
              name: 'Română',
              pdfUrl: `/assets/pdfs/preventie-cancer-ro.pdf`
            },
            {
              code: 'en',
              name: 'English',
              pdfUrl: `/assets/pdfs/preventie-cancer-en.pdf`
            },
            {
              code: 'de',
              name: 'Deutsch',
              pdfUrl: `/assets/pdfs/preventie-cancer-de.pdf`
            }
          ]
        },
        {
          id: 2,
          title: this.translate.instant('EDUCATIONAL_PROGRAMS.PROGRAMS.HEART_HEALTH.TITLE'),
          description: this.translate.instant('EDUCATIONAL_PROGRAMS.PROGRAMS.HEART_HEALTH.DESCRIPTION'),
          modules: 8,
          duration: '3.5',
          category: 'heart-health',
          categoryClass: 'category-blue',
          isFree: true,
          rating: 4.9,
          reviewCount: 215,
          languages: [
            {
              code: 'ro',
              name: 'Română',
              pdfUrl: `/assets/pdfs/sanatate-inima-ro.pdf`
            },
            {
              code: 'en',
              name: 'English',
              pdfUrl: `/assets/pdfs/sanatate-inima-en.pdf`
            },
            {
              code: 'de',
              name: 'Deutsch',
              pdfUrl: `/assets/pdfs/sanatate-inima-de.pdf`
            }
          ]
        },
        {
          id: 3,
          title: this.translate.instant('EDUCATIONAL_PROGRAMS.PROGRAMS.HEALTHY_DIET.TITLE'),
          description: this.translate.instant('EDUCATIONAL_PROGRAMS.PROGRAMS.HEALTHY_DIET.DESCRIPTION'),
          modules: 6,
          duration: '2.5',
          category: 'healthy-diet',
          categoryClass: 'category-red',
          isFree: true,
          rating: 4.7,
          reviewCount: 178,
          languages: [
            {
              code: 'ro',
              name: 'Română',
              pdfUrl: `/assets/pdfs/alimentatie-ro.pdf`
            },
            {
              code: 'en',
              name: 'English',
              pdfUrl: `/assets/pdfs/alimentatie-en.pdf`
            },
            {
              code: 'de',
              name: 'Deutsch',
              pdfUrl: `/assets/pdfs/alimentatie-de.pdf`
            }
          ]
        },
        {
          id: 4,
          title: this.translate.instant('EDUCATIONAL_PROGRAMS.PROGRAMS.MENTAL_HEALTH.TITLE'),
          description: this.translate.instant('EDUCATIONAL_PROGRAMS.PROGRAMS.MENTAL_HEALTH.DESCRIPTION'),
          modules: 7,
          duration: '3',
          category: 'mental-health',
          categoryClass: 'category-purple',
          isFree: true,
          rating: 4.9,
          reviewCount: 230,
          languages: [
            {
              code: 'ro',
              name: 'Română',
              pdfUrl: `/assets/pdfs/sanatate_mintala_ro.pdf`
            },
            {
              code: 'en',
              name: 'English',
              pdfUrl: `/assets/pdfs/sanatate_mintala_en.pdf`
            },
            {
              code: 'de',
              name: 'Deutsch',
              pdfUrl: `/assets/pdfs/sanatate_mintala_de.pdf`
            }
          ]
        },
        {
          id: 5,
          title: this.translate.instant('EDUCATIONAL_PROGRAMS.PROGRAMS.DIABETES.TITLE'),
          description: this.translate.instant('EDUCATIONAL_PROGRAMS.PROGRAMS.DIABETES.DESCRIPTION'),
          modules: 8,
          duration: '4',
          category: 'diabetes',
          categoryClass: 'category-orange',
          isFree: true,
          rating: 4.8,
          reviewCount: 185,
          languages: [
            {
              code: 'ro',
              name: 'Română',
              pdfUrl: `/assets/pdfs/diabet_ro.pdf`
            },
            {
              code: 'en',
              name: 'English',
              pdfUrl: `/assets/pdfs/diabet_en.pdf`
            },
            {
              code: 'de',
              name: 'Deutsch',
              pdfUrl: `/assets/pdfs/diabet_de.pdf`
            }
          ]
        },
        {
          id: 6,
          title: this.translate.instant('EDUCATIONAL_PROGRAMS.PROGRAMS.RESPIRATORY.TITLE'),
          description: this.translate.instant('EDUCATIONAL_PROGRAMS.PROGRAMS.RESPIRATORY.DESCRIPTION'),
          modules: 6,
          duration: '2.5',
          category: 'respiratory',
          categoryClass: 'category-lightblue',
          isFree: true,
          rating: 4.7,
          reviewCount: 165,
          languages: [
            {
              code: 'ro',
              name: 'Română',
              pdfUrl: `/assets/pdfs/tulburari_respiratorii_ro.pdf`
            },
            {
              code: 'en',
              name: 'English',
              pdfUrl: `/assets/pdfs/tulburari_respiratorii_en.pdf`
            },
            {
              code: 'de',
              name: 'Deutsch',
              pdfUrl: `/assets/pdfs/tulburari_respiratorii_de.pdf`
            }
          ]
        },
        {
          id: 7,
          title: this.translate.instant('EDUCATIONAL_PROGRAMS.PROGRAMS.PUBLIC_HEALTH.TITLE'),
          description: this.translate.instant('EDUCATIONAL_PROGRAMS.PROGRAMS.PUBLIC_HEALTH.DESCRIPTION'),
          modules: 7,
          duration: '3.5',
          category: 'public-health',
          categoryClass: 'category-teal',
          isFree: true,
          rating: 4.6,
          reviewCount: 140,
          languages: [
            {
              code: 'ro',
              name: 'Română',
              pdfUrl: `/assets/pdfs/sanatate_publica_ro.pdf`
            },
            {
              code: 'en',
              name: 'English',
              pdfUrl: `/assets/pdfs/sanatate_publica_en.pdf`
            },
            {
              code: 'de',
              name: 'Deutsch',
              pdfUrl: `/assets/pdfs/sanatate_publica_de.pdf`
            }
          ]
        },
        {
          id: 8,
          title: this.translate.instant('EDUCATIONAL_PROGRAMS.PROGRAMS.TELEMEDICINE.TITLE'),
          description: this.translate.instant('EDUCATIONAL_PROGRAMS.PROGRAMS.TELEMEDICINE.DESCRIPTION'),
          modules: 5,
          duration: '2',
          category: 'telemedicine',
          categoryClass: 'category-purple',
          isFree: true,
          rating: 4.7,
          reviewCount: 152,
          languages: [
            {
              code: 'ro',
              name: 'Română',
              pdfUrl: `/assets/pdfs/telemedicina_ro.pdf`
            },
            {
              code: 'en',
              name: 'English',
              pdfUrl: `/assets/pdfs/telemedicina_en.pdf`
            },
            {
              code: 'de',
              name: 'Deutsch',
              pdfUrl: `/assets/pdfs/telemedicina_de.pdf`
            }
          ]
        }
      ];

      // Inițializăm programele vizibile
      this.updateVisiblePrograms();
      this.loadingPrograms = false;
    }, 1000); // Simulăm un delay de încărcare
  }

  // Metodă pentru deschiderea conținutului programului educațional
  openProgramContent(program: EducationalProgram, languageCode: string): void {
    // Verifică dacă utilizatorul este autentificat (dacă este necesar)
    // Pentru acum, permitem accesul gratuit pentru toți

    this.currentProgram = program;
    this.selectedLanguage = languageCode;

    // Găsește URL-ul PDF-ului pentru limba selectată
    const languageOption = program.languages.find(lang => lang.code === languageCode);
    if (languageOption) {
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(languageOption.pdfUrl);
      this.showPdfViewer = true;

      // Resetează starea evaluării
      this.pdfCompleted = false;
      this.userRating = 0;
      this.userReview = '';

      // Simulăm completarea PDF-ului după un timp
      // În aplicația reală, ai folosi evenimente JavaScript pentru a detecta când utilizatorul a ajuns la sfârșitul PDF-ului
      setTimeout(() => {
        this.pdfCompleted = true;
      }, 10000); // După 10 secunde, considerăm că utilizatorul a parcurs PDF-ul
    }
  }

  // Închide vizualizatorul de PDF
  closePdfViewer(): void {
    this.showPdfViewer = false;
    this.currentProgram = null;
    this.pdfUrl = null;
  }

  // Metodă pentru evaluarea programului
  rateProgram(rating: number): void {
    this.userRating = rating;
  }

  // Metodă pentru trimiterea evaluării
  submitReview(): void {
    if (!this.userRating || !this.currentProgram) {
      return;
    }

    // În aplicația reală, aici ai face un API call pentru a salva evaluarea
    console.log(`Evaluare pentru programul ${this.currentProgram.id}: ${this.userRating} stele`);
    console.log(`Comentariu: ${this.userReview}`);

    // Actualizăm statisticile local pentru demonstrație
    if (this.currentProgram) {
      const program = this.educationalPrograms.find(p => p.id === this.currentProgram?.id);
      if (program) {
        const oldTotalRating = (program.rating || 0) * (program.reviewCount || 0);
        program.reviewCount = (program.reviewCount || 0) + 1;
        program.rating = (oldTotalRating + this.userRating) / program.reviewCount;
      }
    }

    // Afișăm un mesaj de confirmare și închidem modalul
    alert(this.translate.instant('EDUCATIONAL_PROGRAMS.REVIEW_SUBMITTED'));
    this.closePdfViewer();
  }

  get safeUrl(): SafeResourceUrl {
    return this.pdfUrl || this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
  }
}
