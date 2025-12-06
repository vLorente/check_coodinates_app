import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouteDisplayComponent } from './route-display.component';
import { GoogleMap, MapMarker, MapPolyline, MapDirectionsService } from '@angular/google-maps';
import { of, throwError } from 'rxjs';
import type { ValidationResult } from '@core/models';

describe('RouteDisplayComponent', () => {
  let component: RouteDisplayComponent;
  let fixture: ComponentFixture<RouteDisplayComponent>;
  let mockDirectionsService: any;

  const mockValidationResult: ValidationResult = {
    id: 'test-123',
    isValid: true,
    distance: 5000,
    message: 'Coordenadas válidas',
    address: {
      street: 'Calle Test',
      city: 'Madrid',
      postalCode: '28001',
      country: 'España'
    },
    addressCoordinates: {
      latitude: 40.4168,
      longitude: -3.7038
    },
    inputCoordinates: {
      latitude: 40.4500,
      longitude: -3.7500
    },
    timestamp: new Date('2024-01-01T12:00:00Z')
  };

  const mockDirectionsResponse: google.maps.DirectionsResult = {
    routes: [
      {
        legs: [
          {
            distance: { text: '5.2 km', value: 5200 },
            duration: { text: '12 min', value: 720 },
            start_address: 'Calle Test, Madrid',
            end_address: 'Destino, Madrid',
            start_location: new google.maps.LatLng(40.4168, -3.7038),
            end_location: new google.maps.LatLng(40.4500, -3.7500),
            steps: [],
            via_waypoints: [],
            traffic_speed_entry: [],
            duration_in_traffic: { text: '15 min', value: 900 }
          }
        ],
        overview_path: [
          new google.maps.LatLng(40.4168, -3.7038),
          new google.maps.LatLng(40.4300, -3.7200),
          new google.maps.LatLng(40.4500, -3.7500)
        ],
        bounds: new google.maps.LatLngBounds(),
        copyrights: 'Test',
        summary: 'Test route',
        warnings: [],
        waypoint_order: [],
        overview_polyline: '',
        fare: undefined
      }
    ],
    geocoded_waypoints: [],
    request: {
      origin: { lat: 40.4168, lng: -3.7038 },
      destination: { lat: 40.4500, lng: -3.7500 },
      travelMode: google.maps.TravelMode.DRIVING
    }
  } as any;

  beforeEach(async () => {
    mockDirectionsService = {
      route: vi.fn().mockReturnValue(of(mockDirectionsResponse))
    };

    await TestBed.configureTestingModule({
      imports: [RouteDisplayComponent, GoogleMap, MapMarker, MapPolyline],
      providers: [
        { provide: MapDirectionsService, useValue: mockDirectionsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RouteDisplayComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty route info', () => {
    expect(component.routeInfo()).toBeNull();
    expect(component.routePath()).toEqual([]);
    expect(component.loading()).toBe(false);
  });

  it('should load route when validation result is set', fakeAsync(() => {
    fixture.componentRef.setInput('validationResult', mockValidationResult);
    fixture.componentRef.setInput('showRoute', true);
    fixture.detectChanges();
    tick();

    expect(mockDirectionsService.route).toHaveBeenCalled();
    expect(component.routeInfo()).toEqual({
      distance: '5.2 km',
      duration: '12 min',
      distanceValue: 5200,
      durationValue: 720
    });
  }));

  it('should extract path from directions response', fakeAsync(() => {
    fixture.componentRef.setInput('validationResult', mockValidationResult);
    fixture.componentRef.setInput('showRoute', true);
    fixture.detectChanges();
    tick();

    const path = component.routePath();
    expect(path.length).toBe(3);
    expect(path[0]).toEqual({ lat: 40.4168, lng: -3.7038 });
    expect(path[2]).toEqual({ lat: 40.4500, lng: -3.7500 });
  }));

  it('should not load route when showRoute is false', fakeAsync(() => {
    fixture.componentRef.setInput('validationResult', mockValidationResult);
    fixture.componentRef.setInput('showRoute', false);
    fixture.detectChanges();
    tick();

    expect(mockDirectionsService.route).not.toHaveBeenCalled();
    expect(component.routePath()).toEqual([]);
  }));

  it('should clear route when validation result is null', fakeAsync(() => {
    // First set a result
    fixture.componentRef.setInput('validationResult', mockValidationResult);
    fixture.componentRef.setInput('showRoute', true);
    fixture.detectChanges();
    tick();

    expect(component.routePath().length).toBeGreaterThan(0);

    // Then clear it
    fixture.componentRef.setInput('validationResult', null);
    fixture.detectChanges();
    tick();

    expect(component.routePath()).toEqual([]);
    expect(component.routeInfo()).toBeNull();
  }));

  it('should handle route loading errors', fakeAsync(() => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockDirectionsService.route.mockReturnValue(throwError(() => new Error('Route error')));

    fixture.componentRef.setInput('validationResult', mockValidationResult);
    fixture.componentRef.setInput('showRoute', true);
    fixture.detectChanges();
    tick();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading route:', expect.any(Error));
    expect(component.loading()).toBe(false);

    consoleErrorSpy.mockRestore();
  }));

  it('should use default center when no validation result', () => {
    const options = component.mapOptions();
    expect(options.center).toEqual({ lat: 40.4168, lng: -3.7038 });
    expect(options.zoom).toBe(6);
  });

  it('should center on address when validation result exists', () => {
    fixture.componentRef.setInput('validationResult', mockValidationResult);
    fixture.detectChanges();

    const options = component.mapOptions();
    expect(options.center).toEqual({
      lat: mockValidationResult.addressCoordinates.latitude,
      lng: mockValidationResult.addressCoordinates.longitude
    });
    expect(options.zoom).toBe(14);
  });

  it('should have correct marker positions', () => {
    fixture.componentRef.setInput('validationResult', mockValidationResult);
    fixture.detectChanges();

    expect(component.addressMarker()).toEqual({
      lat: mockValidationResult.addressCoordinates.latitude,
      lng: mockValidationResult.addressCoordinates.longitude
    });

    expect(component.inputMarker()).toEqual({
      lat: mockValidationResult.inputCoordinates.latitude,
      lng: mockValidationResult.inputCoordinates.longitude
    });
  });

  it('should use custom height input', () => {
    const customHeight = '700px';
    fixture.componentRef.setInput('height', customHeight);
    fixture.detectChanges();

    expect(component.height()).toBe(customHeight);
  });
});
