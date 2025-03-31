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
    window.initGoogleCallback = () => {
      console.log('Google Maps callback fired');
      window.googleMapsLoaded = true;
      window.dispatchEvent(new Event('google-maps-loaded'));
    };

    // Fallback timeout in case the callback doesn't work
    setTimeout(() => {
      if (!this.mapsLoaded.value && window.google && window.google.maps) {
        console.log('Maps detected through timeout check');
        this.onGoogleMapsLoaded();
      } else if (!this.mapsLoaded.value) {
        console.error('Google Maps failed to load within timeout period');
      }
    }, 5000);
  }

  private onGoogleMapsLoaded(): void {
    console.log('Google Maps API loaded');
    this.mapsLoaded.next(true);

    // Check if Places library is available
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Places library detected');
      this.placesLoaded.next(true);
    } else {
      console.error('Google Maps Places library is not available');
    }
  }

  public isMapsLoaded(): Observable<boolean> {
    return this.mapsLoaded.asObservable();
  }

  public isPlacesLoaded(): Observable<boolean> {
    return this.placesLoaded.asObservable();
  }
}
