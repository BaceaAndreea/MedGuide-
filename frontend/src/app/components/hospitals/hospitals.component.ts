import {AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {HospitalsService} from '../../services/hospitals.service';
import {catchError, Observable, Subscription, take, throwError} from 'rxjs';
import {PageRespone} from '../../model/page.response.model';
import {Hospital} from '../../model/hospital.model';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import {GoogleMapsService} from '../../services/google-maps.service';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

declare var google: any;

@Component({
  selector: 'app-hospitals',
  standalone: true,
  templateUrl: './hospitals.component.html',
  imports: [
    ReactiveFormsModule,
    NgIf,
    AsyncPipe,
    NgForOf,
    NgClass,
    GoogleMapsModule,
    TranslateModule
  ],
  styleUrl: './hospitals.component.scss'
})
export class HospitalsComponent implements OnInit, AfterViewInit, OnDestroy {
  searchFormGroup!: FormGroup;
  currentPage: number = 0;
  pageSize: number = 6;
  errorMessage!: String;
  pageHospitals!: Observable<PageRespone<Hospital>>;
  hospitalFormGroup!: FormGroup;
  submitted: boolean = false;
  updateHospitalFormGroup!: FormGroup;

  // Google Maps properties
  center: google.maps.LatLngLiteral = { lat: 45.943, lng: 25.0 }; // Romania center
  zoom = 7;
  markerPosition?: google.maps.LatLngLiteral;
  geocoder: google.maps.Geocoder | null = null;
  @ViewChild('addressInput') addressInput!: ElementRef;
  @ViewChild('updateAddressInput') updateAddressInput!: ElementRef;
  mapErrors: string[] = [];
  private subscriptions: Subscription[] = [];
  private mapsInitialized = false;
  private placesInitialized = false;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private hospitalsService: HospitalsService,
    private ngZone: NgZone,
    private googleMapsService: GoogleMapsService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword: this.fb.control('')
    });

    // Initialize hospital form
    this.hospitalFormGroup = this.fb.group({
      name: ["", Validators.required],
      address: ["", Validators.required],
      city: ["", Validators.required],
      lat: [""],
      lng: [""]
    });

    // Initialize update form with the same structure
    this.updateHospitalFormGroup = this.fb.group({
      hospitalId: [""],
      name: ["", Validators.required],
      address: ["", Validators.required],
      city: ["", Validators.required],
      lat: [""],
      lng: [""]
    });

    // Set up Google Maps when it's loaded
    const mapsSub = this.googleMapsService.isMapsLoaded().subscribe(loaded => {
      if (loaded) {
        this.initializeGoogleMapsComponents();
        this.mapsInitialized = true;
      } else {
        console.warn('Waiting for Google Maps API to load...');
      }
    });

    // Additionally, subscribe to Places API load status
    const placesSub = this.googleMapsService.isPlacesLoaded().subscribe(loaded => {
      if (loaded) {
        this.placesInitialized = true;
        console.log('Places API is ready to use');
      }
    });

    this.subscriptions.push(mapsSub, placesSub);

    // Load hospitals
    this.handleSearchHospitals();
  }

  ngAfterViewInit(): void {
    // Additional initialization might be needed here
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeGoogleMapsComponents(): void {
    try {
      // Initialize geocoder with error handling
      if (typeof google !== 'undefined' && google.maps) {
        this.geocoder = new google.maps.Geocoder();
        console.log('Geocoder initialized successfully');
      } else {
        this.mapErrors.push('Failed to initialize geocoder - Google Maps not available');
        console.error('Failed to initialize geocoder - Google Maps not available');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.mapErrors.push(`Error initializing Google Maps components: ${errorMessage}`);
      console.error('Error initializing Google Maps components:', error);
    }
  }

  initAutocomplete(inputElement: ElementRef | null): void {
    if (!inputElement) {
      console.error('Input element is null or undefined');
      return;
    }

    if (!this.mapsInitialized || !this.placesInitialized) {
      console.error('Google Maps or Places API not yet initialized');
      return;
    }

    try {
      console.log('Initializing legacy autocomplete for', inputElement.nativeElement);

      const autocomplete = new google.maps.places.Autocomplete(inputElement.nativeElement, {
        types: ['address'],
        componentRestrictions: { country: 'ro' },
        fields: ['address_components', 'geometry', 'formatted_address']
      });

      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          const place = autocomplete.getPlace();

          if (!place || !place.geometry || !place.geometry.location) {
            this.geocodeAddress(inputElement.nativeElement.value);
            return;
          }

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const formattedAddress = place.formatted_address;
          const addressComponents = place.address_components || [];

          // Update marker and center map
          this.markerPosition = { lat, lng };
          this.center = this.markerPosition;
          this.zoom = 15;

          // Extract city
          let city = '';
          const cityComponent = addressComponents.find((component: any) =>
            component.types.includes('locality')
          );

          if (cityComponent) {
            city = cityComponent.long_name;
          } else {
            this.geocodeAddress(formattedAddress, true);
          }

          const formToUpdate = inputElement.nativeElement.id?.includes('update')
            ? this.updateHospitalFormGroup
            : this.hospitalFormGroup;

          formToUpdate.patchValue({
            address: formattedAddress,
            city: city,
            lat: lat,
            lng: lng
          });

          console.log('Place selected:', formattedAddress, 'City:', city, 'Lat:', lat, 'Lng:', lng);
        });
      });
    } catch (error) {
      console.error('Error initializing legacy Autocomplete:', error);
    }
  }

  private geocodeAddress(address: string, onlyForCity: boolean = false): void {
    if (!this.geocoder || !address) {
      console.error('Geocoder not available or address is empty');
      return;
    }

    this.geocoder.geocode({ address: address }, (results: any, status: string) => {
      this.ngZone.run(() => {
        if (status === 'OK' && results && results[0] && results[0].geometry) {
          console.log('Geocoded address successfully');

          // If we're only looking for the city, don't update marker
          if (!onlyForCity) {
            // Update marker
            this.markerPosition = {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng()
            };

            // Center map
            this.center = this.markerPosition;
            this.zoom = 15;
          }

          // Extract city
          let city = '';
          const cityComponent = results[0].address_components.find((component: any) =>
            component.types.includes('locality')
          );

          if (cityComponent) {
            city = cityComponent.long_name;
          }

          // Get active form
          const activeForm = this.modalService.hasOpenModals() && this.addressInput?.nativeElement
            ? this.hospitalFormGroup
            : this.updateHospitalFormGroup;

          // Only update what we need
          if (onlyForCity) {
            activeForm.patchValue({ city: city });
          } else {
            activeForm.patchValue({
              address: results[0].formatted_address,
              city: city,
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng()
            });
          }
        } else {
          console.error('Geocoding failed:', status);
        }
      });
    });
  }

  openModal(content: any): void {
    this.submitted = false;
    this.hospitalFormGroup.reset();

    // Reset marker and map
    this.markerPosition = undefined;
    this.center = { lat: 45.943, lng: 25.0 }; // Romania center
    this.zoom = 7;

    try {
      const modalRef = this.modalService.open(content, { size: 'xl' });

      // Use a timeout to ensure DOM is ready and Modal has fully initialized
      setTimeout(() => {
        if (this.addressInput) {
          this.initAutocomplete(this.addressInput);
          console.log('Autocomplete initialized for add modal');
        } else {
          console.error('Address input element not available');
        }
      }, 1000);

      // Set up handling for modal closing
      modalRef.result.then(
        () => {
          // Modal closed normally
          console.log('Modal closed successfully');
        },
        (reason) => {
          // Modal dismissed
          console.log('Modal dismissed with reason:', reason);
        }
      );
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }

  mapClick(event: google.maps.MapMouseEvent): void {
    if (!this.geocoder) {
      console.error('Geocoder is not initialized');
      return;
    }

    if (event.latLng) {
      try {
        this.markerPosition = event.latLng.toJSON();
        this.geocoder.geocode({ location: this.markerPosition }, (results: any, status: string) => {
          this.ngZone.run(() => {
            if (status === 'OK' && results && results[0]) {
              const address = results[0].formatted_address;

              // Extract city
              let city = '';
              const cityComponent = results[0].address_components.find((component: any) =>
                component.types.includes('locality')
              );
              if (cityComponent) {
                city = cityComponent.long_name;
              }

              // Determine which form is active and update it
              const isAddHospital = this.modalService.hasOpenModals() && this.addressInput?.nativeElement;
              const activeForm = isAddHospital ? this.hospitalFormGroup : this.updateHospitalFormGroup;

              activeForm.patchValue({
                address: address,
                city: city,
                lat: this.markerPosition?.lat,
                lng: this.markerPosition?.lng
              });
            } else {
              console.error('Reverse geocoding failed:', status);
            }
          });
        });
      } catch (error) {
        console.error('Error in map click handler:', error);
      }
    }
  }

  onCloseModal(modal: any) {
    modal.close();
    this.hospitalFormGroup.reset();

    // Focus pe butonul „Adaugă spital", dacă ai un astfel de element
    const addButton = document.getElementById('add-hospital-button');
    if (addButton) {
      addButton.focus();
    }
  }


  onSaveHospital(modal: any) {
    this.submitted = true;

    if (this.hospitalFormGroup.invalid) {
      console.log("Form is invalid", this.hospitalFormGroup.errors);
      return;
    }

    const hospital = {
      name: this.hospitalFormGroup.value.name,
      address: this.hospitalFormGroup.value.address,
      city: this.hospitalFormGroup.value.city,
      lat: this.hospitalFormGroup.value.lat,
      lng: this.hospitalFormGroup.value.lng
    };

    console.log("Submiting hospital:", hospital);
    this.hospitalsService.createHospital(hospital).subscribe({
      next: () => {
        this.translate.get('SUCCESS.HOSPITAL_CREATED').subscribe((successMessage: string) => {
          alert(successMessage);
        });
        this.handleSearchHospitals();
        this.submitted = false;
        this.hospitalFormGroup.reset();
        modal.close();
      },
      error: err => {
        this.translate.get('ERROR.SAVE_HOSPITAL').subscribe((errorMessage: string) => {
          alert(errorMessage + ": " + err.message);
        });
        console.error("Save error:", err);
      }
    });
  }

  getUpdateHospitalModal(h: Hospital, updateContent: any): void {
    try {
      // Initialize form with hospital data
      this.updateHospitalFormGroup = this.fb.group({
        hospitalId: [h.hospitalId, Validators.required],
        name: [h.name, Validators.required],
        address: [h.address, Validators.required],
        city: [h.city, Validators.required],
        lat: [h.lat || null],
        lng: [h.lng || null]
      });

      // Set marker position
      if (h.lat && h.lng) {
        this.markerPosition = { lat: h.lat, lng: h.lng };
        this.center = this.markerPosition;
        this.zoom = 15;
      } else {
        this.markerPosition = undefined;
        this.center = { lat: 45.943, lng: 25.0 };
        this.zoom = 7;
      }

      const modalRef = this.modalService.open(updateContent, { size: 'xl' });

      setTimeout(() => {
        if (this.updateAddressInput) {
          this.initAutocomplete(this.updateAddressInput);
          console.log('Autocomplete initialized for update modal');
        } else {
          console.error('Update address input element not available');
        }
      }, 1000);
    } catch (error) {
      console.error('Error opening update modal:', error);
    }
  }

  onUpdateHospital(updateModal: any) {
    this.submitted = true;
    if (this.updateHospitalFormGroup.invalid) return;

    const hospital = {
      hospitalId: this.updateHospitalFormGroup.value.hospitalId,
      name: this.updateHospitalFormGroup.value.name,
      address: this.updateHospitalFormGroup.value.address,
      city: this.updateHospitalFormGroup.value.city,
      lat: this.updateHospitalFormGroup.value.lat,
      lng: this.updateHospitalFormGroup.value.lng
    };

    this.hospitalsService.updateHospital(hospital, hospital.hospitalId).subscribe({
      next: () => {
        this.translate.get('SUCCESS.HOSPITAL_UPDATED').subscribe((successMessage: string) => {
          alert(successMessage);
        });
        this.handleSearchHospitals();
        this.submitted = false;
        updateModal.close();
      },
      error: err => {
        this.translate.get('ERROR.UPDATE_HOSPITAL').subscribe((errorMessage: string) => {
          alert(errorMessage + ": " + err.message);
        });
      }
    });
  }

  handleSearchHospitals() {
    let keyword = this.searchFormGroup.value.keyword;
    this.pageHospitals = this.hospitalsService.searchHospitals(keyword, this.currentPage, this.pageSize).pipe(
      catchError(err => {
        this.translate.get('ERROR.FETCH_HOSPITALS').subscribe((errorMessage: string) => {
          this.errorMessage = errorMessage;
        });
        return throwError(() => err);
      })
    );
  }

  gotoPage(page: number) {
    if (page < 0 || page >= this.pageSize) return;  // Validare pagina
    this.currentPage = page;
    this.handleSearchHospitals();
  }

  handleDeleteHospital(h: Hospital) {
    this.translate.get('CONFIRMATION.DELETE_HOSPITAL').subscribe((confirmMessage: string) => {
      let conf = confirm(confirmMessage);
      if (!conf) return;

      this.hospitalsService.deleteHospital(h.hospitalId).subscribe({
        next: () => {
          this.translate.get('SUCCESS.HOSPITAL_DELETED').subscribe((successMessage: string) => {
            alert(successMessage);
          });
          this.handleSearchHospitals();
        },
        error: err => {
          this.translate.get('ERROR.DELETE_HOSPITAL').subscribe((errorMessage: string) => {
            alert(errorMessage + ": " + err.message);
          });
          console.log(err);
        }
      });
    });
  }
}
