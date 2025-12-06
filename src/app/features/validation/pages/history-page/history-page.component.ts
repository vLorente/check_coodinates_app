import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ValidationHistoryComponent } from '@features/validation/components/validation-history/validation-history.component';
import { type ValidationResult } from '@core/models';

@Component({
  selector: 'app-history-page',
  imports: [ValidationHistoryComponent],
  templateUrl: './history-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryPageComponent {
  handleSelectValidation(validation: ValidationResult): void {
    // Abrir Google Maps con la ruta entre dirección y coordenadas
    const origin = `${validation.addressCoordinates.latitude},${validation.addressCoordinates.longitude}`;
    const destination = `${validation.inputCoordinates.latitude},${validation.inputCoordinates.longitude}`;

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

    window.open(googleMapsUrl, '_blank');
  }

  handleDeleteValidation(id: string): void {
    console.log('Validación eliminada:', id);
  }
}
