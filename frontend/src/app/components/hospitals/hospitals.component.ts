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
    GoogleMapsModule
  ],
  styleUrl: './hospitals.component.scss'
})
export class HospitalsComponent implements OnInit, AfterViewInit, OnDestroy {
  searchFormGroup!: FormGroup;
  currentPage: number = 0;
  pageSize: number = 10;
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

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private hospitalsService: HospitalsService,
    private ngZone: NgZone,
    private googleMapsService: GoogleMapsService
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

    this.subscriptions.push(mapsSub);

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

    if (!this.mapsInitialized) {
      console.error('Google Maps not yet initialized');
      return;
    }

    try {
      console.log('Initializing autocomplete for', inputElement.nativeElement);

      // Check if window.google is available
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error('Google Maps Places API is not available');
        return;
      }

      // Using the PlaceAutocompleteElement as recommended by Google
      // (but with fallback to legacy Autocomplete if necessary)
      if (google.maps.places.PlaceAutocompleteElement) {
        console.log('Using modern PlaceAutocompleteElement');

        // Check if there's already an existing autocomplete element
        const existingAutocomplete = inputElement.nativeElement.nextElementSibling;
        if (existingAutocomplete && existingAutocomplete.tagName === 'GMP-PLACE-AUTOCOMPLETE') {
          console.log('Autocomplete element already exists, skipping initialization');
          return;
        }

        // Create the PlaceAutocompleteElement
        const autocompleteElement = new google.maps.places.PlaceAutocompleteElement({
          types: ['address'],
          componentRestrictions: { country: 'ro' },
          fields: ['address_components', 'geometry', 'formatted_address']
        });

        // Insert after the input
        inputElement.nativeElement.parentNode.insertBefore(
          autocompleteElement,
          inputElement.nativeElement.nextSibling
        );

        // Hide the original input
        inputElement.nativeElement.style.display = 'none';

        // Listen for place selection
        autocompleteElement.addEventListener('gmp-placeselect', (event: any) => {
          this.ngZone.run(() => {
            const place = event.detail.place;
            this.handlePlaceSelection(place, inputElement);
          });
        });
      } else {
        console.log('Falling back to legacy Autocomplete');

        // Use the legacy Autocomplete
        const autocomplete = new google.maps.places.Autocomplete(inputElement.nativeElement, {
          types: ['address'],
          componentRestrictions: { country: 'ro' },
          fields: ['address_components', 'geometry', 'formatted_address']
        });

        autocomplete.addListener('place_changed', () => {
          this.ngZone.run(() => {
            const place = autocomplete.getPlace();
            this.handlePlaceSelection(place, inputElement);
          });
        });
      }
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }
  }

  private handlePlaceSelection(place: any, inputElement: ElementRef): void {
    if (!place || !place.geometry) {
      console.error('No geometry returned for selected place');
      // Try to recover by using geocoding service
      this.geocodeAddress(place.formatted_address || inputElement.nativeElement.value);
      return;
    }

    // Update marker position
    this.markerPosition = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };

    // Center map
    this.center = this.markerPosition;
    this.zoom = 15;

    // Extract city
    let city = '';
    const addressComponents = place.address_components || [];
    const cityComponent = addressComponents.find((component: any) =>
      component.types.includes('locality')
    );

    if (cityComponent) {
      city = cityComponent.long_name;
    }

    // Update the appropriate form
    const formToUpdate = inputElement === this.addressInput
      ? this.hospitalFormGroup
      : this.updateHospitalFormGroup;

    formToUpdate.patchValue({
      address: place.formatted_address,
      city: city,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    });

    console.log('Place selected:', place.formatted_address);
  }

  private geocodeAddress(address: string): void {
    if (!this.geocoder || !address) {
      console.error('Geocoder not available or address is empty');
      return;
    }

    this.geocoder.geocode({ address: address }, (results: any, status: string) => {
      this.ngZone.run(() => {
        if (status === 'OK' && results && results[0] && results[0].geometry) {
          console.log('Geocoded address successfully');

          // Update marker
          this.markerPosition = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          };

          // Center map
          this.center = this.markerPosition;
          this.zoom = 15;

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

          activeForm.patchValue({
            address: results[0].formatted_address,
            city: city,
            lat: this.markerPosition.lat,
            lng: this.markerPosition.lng
          });
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

      // Use a slightly longer timeout to ensure the DOM is ready
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
        alert("Hospital saved successfully");
        this.handleSearchHospitals();
        this.submitted = false;
        this.hospitalFormGroup.reset();
        modal.close();
      },
      error: err => {
        alert("Error saving hospital: " + err.message);
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
        alert("Success updating Hospital");
        this.handleSearchHospitals();
        this.submitted = false;
        updateModal.close();
      },
      error: err => {
        alert("Error updating hospital: " + err.message);
      }
    });
  }

  handleSearchHospitals() {
    let keyword = this.searchFormGroup.value.keyword;
    this.pageHospitals = this.hospitalsService.searchHospitals(keyword, this.currentPage, this.pageSize).pipe(
      catchError(err => {
        this.errorMessage = err.message;
        return throwError(err);
      })
    );
  }

  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchHospitals();
  }

  handleDeleteHospital(h: Hospital) {
    let conf = confirm("Are you sure?");
    if (!conf) return;
    this.hospitalsService.deleteHospital(h.hospitalId).subscribe({
      next: () => {
        this.handleSearchHospitals();
      },
      error: err => {
        alert(err.message);
        console.log(err);
      }
    });
  }
}
