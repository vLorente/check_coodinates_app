import { TestBed } from '@angular/core/testing';
import { MapService } from './map.service';
import { Coordinate, Address } from '../models';

describe('MapService', () => {
  let service: MapService;

  const mockAddress: Address = {
    street: 'Calle Test 123',
    city: 'Madrid',
    postalCode: '28001',
    country: 'España'
  };

  const mockCoordinate: Coordinate = {
    latitude: 40.4168,
    longitude: -3.7038
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MapService]
    });

    service = TestBed.inject(MapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate distance between two coordinates', () => {
    const coord1: Coordinate = { latitude: 40.4168, longitude: -3.7038 };
    const coord2: Coordinate = { latitude: 40.4170, longitude: -3.7040 };

    const distance = service.calculateDistance(coord1, coord2);

    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(1000); // Menos de 1km
  });

  it('should format distance in meters', () => {
    const formatted = service.formatDistance(500);
    expect(formatted).toBe('500 m');
  });

  it('should format distance in kilometers', () => {
    const formatted = service.formatDistance(2500);
    expect(formatted).toBe('2.50 km');
  });

  it('should clear error', () => {
    service['errorSignal'].set('Test error');
    expect(service.error()).toBe('Test error');

    service.clearError();
    expect(service.error()).toBeNull();
  });

  it('should calculate distance of zero for same coordinates', () => {
    const coord: Coordinate = { latitude: 40.4168, longitude: -3.7038 };
    const distance = service.calculateDistance(coord, coord);

    expect(distance).toBe(0);
  });

  it('should format very large distances', () => {
    const formatted = service.formatDistance(1234567);
    expect(formatted).toContain('km');
    expect(formatted).toContain('1234.57');
  });
});
