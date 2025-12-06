import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Coordinate, Address, formatAddress } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private geocoder: google.maps.Geocoder | null = null;
  private directionsService: google.maps.DirectionsService | null = null;

  private loadingSignal = signal(false);
  loading = this.loadingSignal.asReadonly();

  private errorSignal = signal<string | null>(null);
  error = this.errorSignal.asReadonly();

  constructor() {
    this.initializeServices();
  }

  private async initializeServices(): Promise<void> {
    try {
      // Verificar que Google Maps esté cargado
      if (typeof google === 'undefined' || !google.maps) {
        console.warn('Google Maps no está disponible aún');
        return;
      }

      this.geocoder = new google.maps.Geocoder();
      this.directionsService = new google.maps.DirectionsService();
    } catch (error) {
      console.error('Error al inicializar servicios de Google Maps:', error);
    }
  }

  async geocodeAddress(address: Address): Promise<Coordinate> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      if (!this.geocoder) {
        await this.initializeServices();
        if (!this.geocoder) {
          throw new Error('Geocoder no disponible');
        }
      }

      const fullAddress = formatAddress(address);

      return new Promise<Coordinate>((resolve, reject) => {
        this.geocoder!.geocode({ address: fullAddress }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            resolve({
              latitude: location.lat(),
              longitude: location.lng()
            });
          } else {
            reject(new Error(`Geocoding falló: ${status}`));
          }
        });
      });
    } catch (error: any) {
      const errorMessage = error?.message || 'Error al geocodificar dirección';
      this.errorSignal.set(errorMessage);
      console.error('Error en geocodeAddress:', error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async getDirections(
    origin: Coordinate,
    destination: Coordinate
  ): Promise<google.maps.DirectionsResult> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      if (!this.directionsService) {
        await this.initializeServices();
        if (!this.directionsService) {
          throw new Error('DirectionsService no disponible');
        }
      }

      return new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        this.directionsService!.route(
          {
            origin: { lat: origin.latitude, lng: origin.longitude },
            destination: { lat: destination.latitude, lng: destination.longitude },
            travelMode: google.maps.TravelMode.DRIVING
          },
          (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
            if (status === 'OK' && result) {
              resolve(result);
            } else {
              reject(new Error(`Directions request falló: ${status}`));
            }
          }
        );
      });
    } catch (error: any) {
      const errorMessage = error?.message || 'Error al obtener direcciones';
      this.errorSignal.set(errorMessage);
      console.error('Error en getDirections:', error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (coord1.latitude * Math.PI) / 180;
    const φ2 = (coord2.latitude * Math.PI) / 180;
    const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
  }

  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}
