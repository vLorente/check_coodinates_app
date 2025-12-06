import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import {
  type ValidationRequest,
  type ValidationResult,
  type ValidationApiResponse,
  mapApiResponseToValidationResult
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private apiService = inject(ApiService);
  private storageService = inject(StorageService);

  // Estado con signals
  private validationsSignal = signal<ValidationResult[]>([]);
  validations = this.validationsSignal.asReadonly();

  private loadingSignal = signal(false);
  loading = this.loadingSignal.asReadonly();

  private errorSignal = signal<string | null>(null);
  error = this.errorSignal.asReadonly();

  // Computed values
  validationCount = computed(() => this.validations().length);
  hasValidations = computed(() => this.validations().length > 0);
  lastValidation = computed(() => {
    const validations = this.validations();
    return validations.length > 0 ? validations[0] : null;
  });

  constructor() {
    this.loadValidationsFromStorage();
  }

  async validateCoordinates(request: ValidationRequest): Promise<ValidationResult> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const response = await this.apiService.post<ValidationApiResponse>(
        '/validate',
        {
          address: request.address,
          coordinates: request.coordinates
        }
      );

      const result = mapApiResponseToValidationResult(response, request.address);

      // Agregar al inicio del array
      this.validationsSignal.update(validations => [result, ...validations]);

      // Persistir en storage
      this.saveValidationsToStorage();

      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Error al validar coordenadas';
      this.errorSignal.set(errorMessage);
      console.error('Error en validateCoordinates:', error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadValidations(): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const response = await this.apiService.get<ValidationApiResponse[]>('/validations');

      const validations = response.map(item =>
        mapApiResponseToValidationResult(item, {
          street: '',
          city: '',
          postalCode: '',
          country: ''
        })
      );

      this.validationsSignal.set(validations);
      this.saveValidationsToStorage();
    } catch (error: any) {
      const errorMessage = error?.message || 'Error al cargar validaciones';
      this.errorSignal.set(errorMessage);
      console.error('Error en loadValidations:', error);

      // Si falla la API, cargar desde storage
      this.loadValidationsFromStorage();
    } finally {
      this.loadingSignal.set(false);
    }
  }

  deleteValidation(id: string): void {
    this.validationsSignal.update(validations =>
      validations.filter(v => v.id !== id)
    );
    this.saveValidationsToStorage();
  }

  clearValidations(): void {
    this.validationsSignal.set([]);
    this.storageService.clear();
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  private loadValidationsFromStorage(): void {
    const stored = this.storageService.load<ValidationResult[]>('validations');
    if (stored) {
      // Convertir strings de fecha a objetos Date
      const validations = stored.map((v: ValidationResult) => ({
        ...v,
        timestamp: new Date(v.timestamp)
      }));
      this.validationsSignal.set(validations);
    }
  }

  private saveValidationsToStorage(): void {
    this.storageService.save('validations', this.validations());
  }
}
