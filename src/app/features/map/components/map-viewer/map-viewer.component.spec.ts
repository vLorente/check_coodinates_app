import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MapViewerComponent } from './map-viewer.component';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import type { ValidationResult } from '@core/models';

describe('MapViewerComponent', () => {
  let component: MapViewerComponent;
  let fixture: ComponentFixture<MapViewerComponent>;

  const mockValidationResult: ValidationResult = {
    id: 'test-123',
    isValid: true,
    distance: 150,
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
      latitude: 40.4170,
      longitude: -3.7040
    },
    timestamp: new Date('2024-01-01T12:00:00Z')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapViewerComponent, GoogleMap, MapMarker]
    }).compileComponents();

    fixture = TestBed.createComponent(MapViewerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use default center (Madrid) when no validation result', () => {
    const options = component.mapOptions();
    expect(options.center).toEqual({ lat: 40.4168, lng: -3.7038 });
    expect(options.zoom).toBe(6);
  });

  it('should center on address coordinates when validation result exists', () => {
    fixture.componentRef.setInput('validationResult', mockValidationResult);
    fixture.detectChanges();

    const options = component.mapOptions();
    expect(options.center).toEqual({
      lat: mockValidationResult.addressCoordinates.latitude,
      lng: mockValidationResult.addressCoordinates.longitude
    });
    expect(options.zoom).toBe(14);
  });

  it('should return null markers when no validation result', () => {
    expect(component.addressMarker()).toBeNull();
    expect(component.inputMarker()).toBeNull();
  });

  it('should compute address marker position from validation result', () => {
    fixture.componentRef.setInput('validationResult', mockValidationResult);
    fixture.detectChanges();

    const marker = component.addressMarker();
    expect(marker).toEqual({
      lat: mockValidationResult.addressCoordinates.latitude,
      lng: mockValidationResult.addressCoordinates.longitude
    });
  });

  it('should compute input marker position from validation result', () => {
    fixture.componentRef.setInput('validationResult', mockValidationResult);
    fixture.detectChanges();

    const marker = component.inputMarker();
    expect(marker).toEqual({
      lat: mockValidationResult.inputCoordinates.latitude,
      lng: mockValidationResult.inputCoordinates.longitude
    });
  });

  it('should emit onMarkerClick with "address" when address marker clicked', () => {
    const emitSpy = vi.fn();
    component.onMarkerClick.subscribe(emitSpy);

    component.handleAddressMarkerClick();

    expect(emitSpy).toHaveBeenCalledWith('address');
  });

  it('should emit onMarkerClick with "input" when input marker clicked', () => {
    const emitSpy = vi.fn();
    component.onMarkerClick.subscribe(emitSpy);

    component.handleInputMarkerClick();

    expect(emitSpy).toHaveBeenCalledWith('input');
  });

  it('should use custom height input', () => {
    const customHeight = '800px';
    fixture.componentRef.setInput('height', customHeight);
    fixture.detectChanges();

    expect(component.height()).toBe(customHeight);
  });

  it('should have correct marker options', () => {
    const addressOptions = component.addressMarkerOptions();
    expect(addressOptions.title).toBe('Dirección geocodificada');
    expect(addressOptions.icon?.url).toContain('blue-dot.png');

    const inputOptions = component.inputMarkerOptions();
    expect(inputOptions.title).toBe('Coordenadas ingresadas');
    expect(inputOptions.icon?.url).toContain('red-dot.png');
  });
});
