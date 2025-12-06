import { Component, input, signal, computed, effect, inject, ChangeDetectionStrategy } from '@angular/core';
import { GoogleMap, MapMarker, MapPolyline, MapDirectionsService, MapDirectionsResponse } from '@angular/google-maps';
import { map } from 'rxjs';
import type { ValidationResult } from '@core/models';

interface RouteInfo {
  distance: string;
  duration: string;
  distanceValue: number;
  durationValue: number;
}

@Component({
  selector: 'app-route-display',
  imports: [GoogleMap, MapMarker, MapPolyline],
  templateUrl: './route-display.component.html',
  styleUrl: './route-display.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RouteDisplayComponent {
  private directionsService = inject(MapDirectionsService);

  // Inputs
  validationResult = input<ValidationResult | null>(null);
  height = input<string>('500px');
  showRoute = input<boolean>(true);

  // Signals
  routeInfo = signal<RouteInfo | null>(null);
  routePath = signal<google.maps.LatLngLiteral[]>([]);
  loading = signal<boolean>(false);

  // Map configuration
  mapOptions = computed<google.maps.MapOptions>(() => {
    const result = this.validationResult();

    const center = result
      ? { lat: result.addressCoordinates.latitude, lng: result.addressCoordinates.longitude }
      : { lat: 40.4168, lng: -3.7038 };

    return {
      center,
      zoom: result ? 14 : 6,
      mapTypeId: 'roadmap',
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: true,
      fullscreenControl: true
    };
  });

  // Markers
  addressMarker = computed<google.maps.LatLngLiteral | null>(() => {
    const result = this.validationResult();
    if (!result) return null;

    return {
      lat: result.addressCoordinates.latitude,
      lng: result.addressCoordinates.longitude
    };
  });

  addressMarkerOptions = signal<google.maps.MarkerOptions>({
    title: 'Dirección geocodificada',
    icon: {
      url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    },
    animation: google.maps.Animation.DROP
  });

  inputMarker = computed<google.maps.LatLngLiteral | null>(() => {
    const result = this.validationResult();
    if (!result) return null;

    return {
      lat: result.inputCoordinates.latitude,
      lng: result.inputCoordinates.longitude
    };
  });

  inputMarkerOptions = signal<google.maps.MarkerOptions>({
    title: 'Coordenadas ingresadas',
    icon: {
      url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    },
    animation: google.maps.Animation.DROP
  });

  // Polyline options
  polylineOptions = signal<google.maps.PolylineOptions>({
    strokeColor: '#4285f4',
    strokeOpacity: 0.8,
    strokeWeight: 4
  });

  constructor() {
    // Effect to load route when validation result changes
    effect(() => {
      const result = this.validationResult();
      const shouldShow = this.showRoute();

      if (result && shouldShow) {
        this.loadRoute(result);
      } else {
        this.routePath.set([]);
        this.routeInfo.set(null);
      }
    });
  }

  private loadRoute(result: ValidationResult): void {
    this.loading.set(true);

    const request: google.maps.DirectionsRequest = {
      origin: {
        lat: result.addressCoordinates.latitude,
        lng: result.addressCoordinates.longitude
      },
      destination: {
        lat: result.inputCoordinates.latitude,
        lng: result.inputCoordinates.longitude
      },
      travelMode: google.maps.TravelMode.DRIVING
    };

    this.directionsService.route(request).pipe(
      map((response: MapDirectionsResponse) => {
        const result = response.result;
        if (result && result.routes && result.routes.length > 0) {
          const route = result.routes[0];
          const leg = route.legs[0];

          // Extract path points
          const path: google.maps.LatLngLiteral[] = [];
          route.overview_path.forEach((point: google.maps.LatLng) => {
            path.push({ lat: point.lat(), lng: point.lng() });
          });

          this.routePath.set(path);
          this.routeInfo.set({
            distance: leg.distance?.text || '',
            duration: leg.duration?.text || '',
            distanceValue: leg.distance?.value || 0,
            durationValue: leg.duration?.value || 0
          });
        }
        this.loading.set(false);
      })
    ).subscribe({
      error: (error) => {
        console.error('Error loading route:', error);
        this.loading.set(false);
      }
    });
  }
}
