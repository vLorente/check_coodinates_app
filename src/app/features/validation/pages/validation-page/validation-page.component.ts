import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ValidationFormComponent } from '@features/validation/components/validation-form/validation-form.component';
import { ValidationResultComponent } from '@features/validation/components/validation-result/validation-result.component';
import { ValidationService } from '@core/services/validation.service';
import { type ValidationResult } from '@core/models';

@Component({
  selector: 'app-validation-page',
  imports: [
    ValidationFormComponent,
    ValidationResultComponent
  ],
  templateUrl: './validation-page.component.html',
  styleUrl: './validation-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationPageComponent {
  private validationService = inject(ValidationService);

  // Signals
  showResult = signal(false);

  // Service signals
  lastValidation = this.validationService.lastValidation;

  handleValidationComplete(): void {
    this.showResult.set(true);
  }

  handleViewMap(validation: ValidationResult): void {
    // Construir URL de Google Maps con marcadores y ruta
    const origin = `${validation.addressCoordinates.latitude},${validation.addressCoordinates.longitude}`;
    const destination = `${validation.inputCoordinates.latitude},${validation.inputCoordinates.longitude}`;

    // URL con dirección y ruta entre los dos puntos
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

    // Abrir en nueva pestaña
    window.open(googleMapsUrl, '_blank');
  }
}
