import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { type ValidationResult } from '@core/models';

@Component({
  selector: 'app-validation-result',
  imports: [CommonModule],
  templateUrl: './validation-result.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationResultComponent {
  // Inputs
  result = input.required<ValidationResult>();

  // Outputs
  onViewMap = output<ValidationResult>();

  // Computed values
  distanceFormatted = computed(() => {
    const distance = this.result().distance;
    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    }
    return `${(distance / 1000).toFixed(2)} km`;
  });

  addressFormatted = computed(() => {
    const addr = this.result().address;
    return `${addr.street}, ${addr.city}, ${addr.postalCode}, ${addr.country}`;
  });

  timestampFormatted = computed(() => {
    return new Date(this.result().timestamp).toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  });

  handleViewMap(): void {
    this.onViewMap.emit(this.result());
  }
}
