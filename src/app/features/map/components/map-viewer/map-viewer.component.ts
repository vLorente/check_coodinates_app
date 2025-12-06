import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import type { ValidationResult } from '@core/models';

@Component({
  selector: 'app-map-viewer',
  imports: [GoogleMap, MapMarker],
  templateUrl: './map-viewer.component.html',
  styleUrl: './map-viewer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapViewerComponent {
  // Inputs
  validationResult = input<ValidationResult | null>(null);
  height = input<string>('500px');

  // Outputs
  onMarkerClick = output<'address' | 'input'>();

  // Map configuration
  mapOptions = computed<google.maps.MapOptions>(() => {
    const result = this.validationResult();

    // Si hay resultado, centrar en la dirección geocodificada
    const center = result
      ? { lat: result.addressCoordinates.latitude, lng: result.addressCoordinates.longitude }
      : { lat: 40.4168, lng: -3.7038 }; // Madrid por defecto

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

  // Address marker (blue - geocoded from address)
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

  // Input coordinates marker (red - user provided)
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

  // Marker click handlers
  handleAddressMarkerClick(): void {
    this.onMarkerClick.emit('address');
  }

  handleInputMarkerClick(): void {
    this.onMarkerClick.emit('input');
  }
}
