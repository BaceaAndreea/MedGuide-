import { Injectable } from '@angular/core';
import {BehaviorSubject, fromEvent, Observable, of, take} from 'rxjs';

declare global {
  interface Window {
    google?: any;
    googleMapsLoaded?: boolean;
    initGoogleCallback?: () => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
  private mapsLoaded = new BehaviorSubject<boolean>(false);
  private placesLoaded = new BehaviorSubject<boolean>(false);
  private API_LOAD_TIMEOUT = 10000; // 10 seconds timeout

  constructor() {
    this.initGoogleMapsLoader();
  }

  private initGoogleMapsLoader(): void {
    // Check if maps already loaded
    if (window.googleMapsLoaded) {
      this.onGoogleMapsLoaded();
      return;
    }

    // Check if Google Maps API is already available
    if (window.google && window.google.maps) {
      console.log('Google Maps already available');
      this.onGoogleMapsLoaded();
      return;
    }

    // Listen for the custom event from our callback
    fromEvent(window, 'google-maps-loaded').pipe(take(1)).subscribe(() => {
      this.onGoogleMapsLoaded();
    });

    // Add a global callback function that will be called when the script loads
    window.initGoogleCallback = function() {
      console.log('Google Maps API loaded via callback');
      window.googleMapsLoaded = true;

      // Add a slight delay to ensure all libraries are fully initialized
      setTimeout(() => {
        window.dispatchEvent(new Event('google-maps-loaded'));
      }, 500);
    };

    // Set up a more robust timeout check that periodically tries to detect Google Maps
    const checkInterval = 500; // Check every 500ms
    let elapsedTime = 0;

    const intervalId = setInterval(() => {
      elapsedTime += checkInterval;

      if (this.mapsLoaded.value) {
        // Maps already loaded, stop checking
        clearInterval(intervalId);
        return;
      }

      if (window.google && window.google.maps) {
        console.log('Maps detected through interval check');
        this.onGoogleMapsLoaded();
        clearInterval(intervalId);
        return;
      }

      if (elapsedTime >= this.API_LOAD_TIMEOUT) {
        console.error('Google Maps failed to load within timeout period');
        clearInterval(intervalId);

        // Even after timeout, keep checking if Maps appears later
        const lateCheckIntervalId = setInterval(() => {
          if (window.google && window.google.maps) {
            console.log('Maps detected late, after timeout');
            this.onGoogleMapsLoaded();
            clearInterval(lateCheckIntervalId);
          }
        }, 2000); // Check every 2 seconds after timeout

        // Eventually stop checking altogether after 30 seconds
        setTimeout(() => {
          clearInterval(lateCheckIntervalId);
        }, 30000);
      }
    }, checkInterval);
  }

  private onGoogleMapsLoaded(): void {
    console.log('Google Maps API loaded');
    this.mapsLoaded.next(true);

    // Check if Places library is available
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Places library detected');
      this.placesLoaded.next(true);

      // Check which Places API is available (new or legacy)
      if (window.google.maps.places.PlaceAutocompleteElement) {
        console.log('New PlaceAutocompleteElement API is available');
      } else if (window.google.maps.places.Autocomplete) {
        console.log('Legacy Autocomplete API is available');
      } else {
        console.warn('Neither PlaceAutocompleteElement nor Autocomplete is available');
      }
    } else {
      console.error('Google Maps Places library is not available');

      // Try to detect if Places API loads later
      const placesCheckIntervalId = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          console.log('Places library detected after delay');
          this.placesLoaded.next(true);
          clearInterval(placesCheckIntervalId);
        }
      }, 1000); // Check every second

      // Stop checking after 20 seconds
      setTimeout(() => {
        clearInterval(placesCheckIntervalId);
      }, 20000);
    }
  }

  public isMapsLoaded(): Observable<boolean> {
    return this.mapsLoaded.asObservable();
  }

  public isPlacesLoaded(): Observable<boolean> {
    return this.placesLoaded.asObservable();
  }

  // Helper method to manually load Places library if it's not loaded automatically
  public loadPlacesLibrary(): void {
    if (this.placesLoaded.value) {
      console.log('Places library already loaded');
      return;
    }

    if (!window.google || !window.google.maps) {
      console.error('Cannot load Places library because Maps API is not loaded yet');
      return;
    }

    try {
      // Check if we need to load the Places library
      if (!window.google.maps.places) {
        console.log('Attempting to load Places library manually');

        // This is one approach to load the Places library dynamically
        // Note: This approach may not work in all scenarios due to Google Maps API restrictions
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?libraries=places&callback=initPlacesCallback`;
        script.async = true;
        script.defer = true;

        // Add a callback for when Places loads
        (window as any).initPlacesCallback = () => {
          console.log('Places library loaded manually');
          this.placesLoaded.next(true);
        };

        document.head.appendChild(script);
      }
    } catch (error) {
      console.error('Error trying to load Places library:', error);
    }
  }
}
