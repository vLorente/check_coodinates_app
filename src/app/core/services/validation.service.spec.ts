import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ValidationService } from './validation.service';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { ValidationRequest, ValidationResult } from '../models';
import { vi } from 'vitest';

describe('ValidationService', () => {
  let service: ValidationService;
  let apiServiceMock: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };
  let storageServiceMock: { save: ReturnType<typeof vi.fn>; load: ReturnType<typeof vi.fn>; clear: ReturnType<typeof vi.fn> };

  const mockRequest: ValidationRequest = {
    address: {
      street: 'Calle Test 123',
      city: 'Madrid',
      postalCode: '28001',
      country: 'España'
    },
    coordinates: {
      latitude: 40.4168,
      longitude: -3.7038
    }
  };

  const mockApiResponse = {
    id: '1',
    is_valid: true,
    distance: 50,
    message: 'Coordenadas válidas',
    address_coordinates: { latitude: 40.4168, longitude: -3.7038 },
    input_coordinates: { latitude: 40.4170, longitude: -3.7040 },
    timestamp: new Date().toISOString()
  };

  beforeEach(() => {
    apiServiceMock = {
      get: vi.fn(),
      post: vi.fn()
    };

    storageServiceMock = {
      save: vi.fn(),
      load: vi.fn(),
      clear: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        ValidationService,
        { provide: ApiService, useValue: apiServiceMock },
        { provide: StorageService, useValue: storageServiceMock },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should validate coordinates successfully', fakeAsync(async () => {
    apiServiceMock.post.mockResolvedValue(mockApiResponse);

    expect(service.loading()).toBe(false);
    expect(service.validationCount()).toBe(0);

    const promise = service.validateCoordinates(mockRequest);
    tick();

    const result = await promise;

    expect(result.isValid).toBe(true);
    expect(result.distance).toBe(50);
    expect(service.loading()).toBe(false);
    expect(service.validationCount()).toBe(1);
    expect(storageServiceMock.save).toHaveBeenCalled();
  }));

  it('should handle validation error', fakeAsync(async () => {
    let errorCaught = false;
    const error = new Error('API Error');
    apiServiceMock.post.mockRejectedValue(error);

    const promise = service.validateCoordinates(mockRequest);
    tick();

    try {
      await promise;
    } catch (e: any) {
      errorCaught = true;
      expect(e.message).toContain('API Error');
    }

    expect(errorCaught).toBe(true);
    expect(service.error()).toBeTruthy();
    expect(service.loading()).toBe(false);
  }));

  it('should load validations from API', fakeAsync(async () => {
    apiServiceMock.get.mockResolvedValue([mockApiResponse]);

    const promise = service.loadValidations();
    tick();

    await promise;

    expect(service.validationCount()).toBe(1);
    expect(service.hasValidations()).toBe(true);
    expect(storageServiceMock.save).toHaveBeenCalled();
  }));

  it('should delete validation', () => {
    storageServiceMock.load.mockReturnValue([
      {
        id: '1',
        isValid: true,
        distance: 50,
        message: 'Test',
        addressCoordinates: { latitude: 40, longitude: -3 },
        inputCoordinates: { latitude: 40, longitude: -3 },
        timestamp: new Date(),
        address: mockRequest.address
      }
    ]);

    service['loadValidationsFromStorage']();
    expect(service.validationCount()).toBe(1);

    service.deleteValidation('1');
    expect(service.validationCount()).toBe(0);
    expect(storageServiceMock.save).toHaveBeenCalled();
  });

  it('should clear all validations', () => {
    service.clearValidations();

    expect(service.validationCount()).toBe(0);
    expect(storageServiceMock.clear).toHaveBeenCalled();
  });

  it('should clear error', () => {
    service['errorSignal'].set('Test error');
    expect(service.error()).toBe('Test error');

    service.clearError();
    expect(service.error()).toBeNull();
  });

  it('should compute lastValidation', fakeAsync(async () => {
    apiServiceMock.post.mockResolvedValue(mockApiResponse);

    expect(service.lastValidation()).toBeNull();

    const promise = service.validateCoordinates(mockRequest);
    tick();
    await promise;

    const last = service.lastValidation();
    expect(last).toBeTruthy();
    expect(last?.id).toBe('1');
  }));
});
